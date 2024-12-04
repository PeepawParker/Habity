const pool = require('../database/index');
const { sendSSEMessage } = require('../utils/realTimeConnection/sseSetup');

exports.postMessageBetweenUsers = async (
  message,
  senderId,
  receiverId,
  chatId,
  messageType,
) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO messages (message_data, sender_id, chat_id, message_type) VALUES ($1, $2, $3, $4) RETURNING time_sent, message_id',
      [message, senderId, chatId, messageType],
    );
    const otherUserId = await client.query(
      'SELECT user_id FROM chat_members WHERE user_id != $1 AND chat_id = $2',
      [senderId, chatId],
    );
    if (messageType === 'message') {
      sendSSEMessage(receiverId, 'newMessage', { chatId });
    } else {
      sendSSEMessage(receiverId, 'newMessageReq', { chatId });
    }

    return {
      timeSent: result.rows[0].time_sent,
      messageId: result.rows[0].message_id,
      otherUserId: otherUserId.rows[0].user_id,
    };
  } finally {
    client.release();
  }
};

exports.replyToMessageRequest = async (
  message,
  senderId,
  receiverId,
  chatId,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE chats SET message_type = 'message', private_user = null WHERE chat_id = $1;`,
      [chatId],
    );
    await client.query(
      `UPDATE messages SET message_type = 'message' WHERE chat_id = $1;`,
      [chatId],
    );
    const result = await client.query(
      `INSERT INTO messages (message_data, sender_id, chat_id, message_type) VALUES ($1, $2, $3, 'message') RETURNING time_sent, message_id`,
      [message, senderId, chatId],
    );

    const otherUserId = await client.query(
      'SELECT user_id FROM chat_members WHERE user_id != $1 AND chat_id = $2',
      [senderId, chatId],
    );

    await client.query('COMMIT');

    return {
      timeSent: result.rows[0].time_sent,
      messageId: result.rows[0].message_id,
      otherUserId: otherUserId.rows[0].user_id,
    };
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback the transaction if there's an error
    throw error; // Re-throw the error to be handled by the caller
  } finally {
    client.release();
  }
};

exports.getRecentChatMessage = async (chatId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT message_id, message_data, time_sent, read_status, sender_id, chat_id, message_type, sender_id AS other_user_id FROM messages WHERE chat_id = $1 ORDER BY time_sent desc LIMIT 1',
      [chatId],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

exports.getAllRecentUserMessages = async (chatIds, curUserId) => {
  const client = await pool.connect();
  try {
    const query = `
      WITH ranked_messages AS (
        SELECT
          m.message_id,
          m.time_sent,
          m.message_data,
          m.read_status,
          m.sender_id,
          m.chat_id,
          m.message_type,
          ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.time_sent DESC) AS row_num
        FROM messages m
        WHERE m.chat_id = ANY($1)
      ),
      chat_participants AS (
        SELECT 
          cm.chat_id,
          cm.user_id AS participant_id
        FROM chat_members cm
        WHERE cm.chat_id = ANY($1) AND cm.user_id != $2
      )
      SELECT
        rm.message_id,
        rm.time_sent,
        rm.message_data,
        rm.read_status,
        rm.sender_id,
        rm.chat_id,
        rm.message_type,
        cp.participant_id AS other_user_id
      FROM ranked_messages rm
      JOIN chat_participants cp ON rm.chat_id = cp.chat_id
      WHERE rm.row_num = 1
      ORDER BY rm.time_sent DESC;
    `;

    const recentUserMessages = await client.query(query, [chatIds, curUserId]);
    return recentUserMessages.rows;
  } finally {
    client.release();
  }
};

exports.getUserIdsFromChatId = async (chatId) => {
  const client = await pool.connect();
  try {
    const userIds = await client.query(
      'SELECT user_id FROM chat_members WHERE chat_id = $1',
      [chatId],
    );
    return userIds.rows;
  } finally {
    client.release();
  }
};

exports.checkIfGroupChat = async (chatId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT chat_name FROM chats WHERE chat_id = $1',
      [chatId],
    );
    const isGroupChat =
      result.rows.length > 0 && result.rows[0].chat_name !== null;
    return isGroupChat;
  } finally {
    client.release();
  }
};

exports.getUserReqChatIds = async (curUserId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT cm.chat_id
      FROM chat_members cm
      JOIN chats c ON cm.chat_id = c.chat_id
      WHERE cm.user_id = $1 AND c.message_type = 'messageRequest' 
    `,
      [curUserId],
    );

    const chatIds = result.rows.map((row) => row.chat_id);
    return chatIds;
  } finally {
    client.release();
  }
};

exports.getUserChatIds = async (curUserId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT cm.chat_id
      FROM chat_members cm
      JOIN chats c ON cm.chat_id = c.chat_id
      WHERE cm.user_id = $1 AND c.message_type = 'message' OR cm.user_id = $1 AND c.message_type = 'messageRequest' AND c.private_user != $1
    `,
      [curUserId],
    );
    const chatIds = result.rows.map((row) => row.chat_id);
    return chatIds;
  } finally {
    client.release();
  }
};

exports.getUnreadChatMsgCountsByChatId = async (chatIds, curUserId) => {
  const client = await pool.connect();
  try {
    // Make this where it accepts the cur user Id and then it makes sure that the senderId is not equal to this value
    const queryText = `
    SELECT chat_id, COUNT(*) AS unread_count
    FROM messages
    WHERE chat_id IN (${chatIds.map((id) => `'${id}'`).join(',')})
      AND read_status = false
      AND sender_id <> $1
    GROUP BY chat_id
  `;
    const { rows } = await client.query(queryText, [curUserId]);
    const unreadCountsByChatId = {};
    rows.forEach((row) => {
      const chatId = row.chat_id;
      const unreadCount = parseInt(row.unread_count, 10);

      unreadCountsByChatId[chatId] = unreadCount;
    });

    return unreadCountsByChatId;
  } finally {
    client.release();
  }
};

exports.getUnreadChatMsgReqCountsByChatId = async (chatIds, curUserId) => {
  const client = await pool.connect();
  try {
    // Make this where it accepts the cur user Id and then it makes sure that the senderId is not equal to this value
    const queryText = `
    SELECT chat_id, COUNT(*) AS unread_count
    FROM messages
    WHERE chat_id IN (${chatIds.map((id) => `'${id}'`).join(',')})
      AND read_status = false
      AND sender_id <> $1
    GROUP BY chat_id
  `;
    const { rows } = await client.query(queryText, [curUserId]);
    const unreadReqCountsByChatId = {};
    rows.forEach((row) => {
      const chatId = row.chat_id;
      const unreadCount = parseInt(row.unread_count, 10);

      unreadReqCountsByChatId[chatId] = unreadCount;
    });

    return unreadReqCountsByChatId;
  } finally {
    client.release();
  }
};

exports.getMessageTypeWithId = async (chatId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT message_type FROM chats WHERE chat_id = $1`,
      [chatId],
    );
    return result.rows[0].message_type;
  } finally {
    client.release();
  }
};

exports.getChatIdBetweenUsers = async (curUserId, userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT chat_id 
       FROM chat_members 
       WHERE user_id IN ($1, $2) 
       GROUP BY chat_id 
       HAVING COUNT(DISTINCT user_id) = 2;`,
      [curUserId, userId],
    );

    const chatId = result.rows.length > 0 ? result.rows[0].chat_id : null;

    return chatId;
  } finally {
    client.release();
  }
};

exports.createChatMessageTypeByIds = async (curUserId, userId) => {
  const client = await pool.connect();
  try {
    const followStatus = await client.query(
      `SELECT pending_status FROM follows WHERE follower_id = $1 AND followed_id = $2`,
      [curUserId, userId],
    );

    if (followStatus.rows.length === 0) {
      const privateStatus = await client.query(
        'SELECT private FROM users WHERE user_id = $1',
        [userId],
      );

      if (privateStatus.rows.length > 0 && privateStatus.rows[0].private) {
        return 'messageRequest';
      }
    } else if (followStatus.rows[0].pending_status) {
      const privateStatus = await client.query(
        'SELECT private FROM users WHERE user_id = $1',
        [userId],
      );

      if (privateStatus.rows.length > 0 && privateStatus.rows[0].private) {
        return 'messageRequest';
      }
    }

    return 'message';
  } finally {
    client.release();
  }
};

exports.createChatForUsers = async (curUserId, userId, messageType) => {
  const client = await pool.connect();
  try {
    let result;
    if (messageType === 'message') {
      result = await client.query(
        `INSERT INTO chats(chat_name, message_type) VALUES(null, 'message') RETURNING chat_id`,
      );
    } else {
      result = await client.query(
        `INSERT INTO chats(chat_name, message_type, private_user) VALUES(null, $1, $2) RETURNING chat_id`,
        [messageType, userId],
      );
    }
    const chatId = result.rows[0].chat_id;
    await client.query(
      'INSERT INTO chat_members(chat_id, user_id) VALUES($1, $2)',
      [chatId, curUserId],
    );
    await client.query(
      'INSERT INTO chat_members(chat_id, user_id) VALUES($1, $2)',
      [chatId, userId],
    );
    return chatId;
  } finally {
    client.release();
  }
};

exports.viewChatMessagesById = async (chatId, curUserId) => {
  const client = await pool.connect();
  try {
    const messages = await client.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY time_sent ASC',
      [chatId],
    );
    await client.query(
      'UPDATE messages SET read_status = true WHERE chat_id = $1 and read_status = false AND sender_id != $2',
      [chatId, curUserId],
    );
    return messages.rows;
  } finally {
    client.release();
  }
};

exports.getRecentMessagesByChatIds = async (chatIds) => {
  const client = await pool.connect();
  try {
    const recentMessages = await client.query(
      `WITH RankedMessages AS (
    SELECT
        message_id, message_data, time_sent, read_status, sender_id, chat_id, message_type,
        ROW_NUMBER() OVER(PARTITION BY chat_id ORDER BY time_sent DESC) AS rn,sender_id AS other_user_id
    FROM messages
    WHERE chat_id = ANY($1) AND read_status = false
)
SELECT message_id, time_sent, message_data, read_status, sender_id, chat_id, other_user_id
FROM RankedMessages
WHERE rn = 1
ORDER BY time_sent DESC;`,
      [chatIds],
    );
    console.log('here are the message rows', recentMessages.rows);
    return recentMessages.rows;
  } finally {
    client.release();
  }
};

exports.getMessagesByChatIds = async (chatId) => {
  const client = await pool.connect();
  try {
    const messages = await client.query(
      'SELECT * FROM messages WHERE chat_id = ANY($1) ORDER BY time_sent ASC',
      [chatId],
    );
    return messages.rows;
  } finally {
    client.release();
  }
};

exports.deleteChatAndMessagesByChatId = async (chatId) => {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM chats WHERE chat_id = $1`, [chatId]);
    await client.query(`DELETE FROM messages WHERE chat_id = $1`, [chatId]);
  } finally {
    client.release();
  }
};

exports.getAllUserChatIds = async (curUserId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT chat_id FROM chat_members Where user_id = $1',
      [curUserId],
    );
    const chatIds = result.rows.map((row) => row.chat_id);
    return chatIds;
  } finally {
    client.release();
  }
};

exports.checkUnreadMessageStatus = async (curUserId, chatIds) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
    SELECT 'messageRequest' AS type, 
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM messages
                  WHERE message_type = 'messageRequest' AND chat_id = ANY($1) AND sender_id != $2 AND read_status = false
              )
              THEN CAST(1 AS BIT) -- True
              ELSE CAST(0 AS BIT) -- False
          END AS row_exists

    UNION ALL 

    SELECT 'message' AS type, 
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM messages
                  WHERE message_type = 'message' AND chat_id = ANY($1) AND sender_id != $2 AND read_status = false
              )
              THEN CAST(1 AS BIT) -- True
              ELSE CAST(0 AS BIT) -- False
          END AS row_exists;
`,
      [chatIds, curUserId],
    );
    return result.rows;
  } finally {
    client.release();
  }
};
