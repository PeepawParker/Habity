const pool = require('../database/index');
const { sendSSEMessage } = require('../utils/realTimeConnection/sseSetup');

//set the viewed to true
exports.getAllNotificationsById = async (userId) => {
  const client = await pool.connect();

  try {
    const notificationResult = await client.query(
      'SELECT * FROM notifications WHERE notified_user_id = $1 ORDER BY notification_id DESC',
      [userId],
    );
    await client.query(
      'UPDATE notifications SET viewed = true WHERE notified_user_id = $1',
      [userId],
    );
    return notificationResult.rows;
  } finally {
    client.release();
  }
};

exports.getCountUnseenChats = async (userChatIds, curUserId) => {
  const client = await pool.connect();

  try {
    const unreadChats = await client.query(
      `
      SELECT chat_id
      FROM messages
      WHERE read_status = false
        AND sender_id != $1
        AND chat_id = ANY($2::int[])
      GROUP BY chat_id
      `,
      [curUserId, userChatIds],
    );
    const unreadChatCount = {};
    unreadChats.rows.forEach((row) => {
      unreadChatCount[row.chat_id] = row.chat_id;
    });
    return unreadChatCount;
  } finally {
    client.release();
  }
};

exports.getCountUnseenNotificationsById = async (userId) => {
  const client = await pool.connect();

  try {
    const notificationCount = await client.query(
      'SELECT COUNT(*) FROM notifications WHERE notified_user_id = $1 AND viewed = false',
      [userId],
    );
    const count = notificationCount.rows[0].count;
    return parseInt(count, 10);
  } finally {
    client.release();
  }
};

exports.postNotification = async (
  notifiedUserId,
  notifierUserId,
  notificationType,
) => {
  const client = await pool.connect();

  try {
    const notification = await client.query(
      'INSERT INTO notifications (notified_user_id, notifier_user_id, notification_type, viewed) VALUES ($1, $2, $3, false) RETURNING notification_id',
      [notifiedUserId, notifierUserId, notificationType],
    );
    console.log('this is the notification type', notificationType);
    if (notification.rows.length > 0) {
      if (notificationType === 'FollowPublic') {
        sendSSEMessage(notifiedUserId, 'addFollow', {
          notificationId: notification.rows[0].notification_id,
        });
      } else {
        console.log('adding notification');
        sendSSEMessage(notifiedUserId, 'addNotification', {
          notificationId: notification.rows[0].notification_id,
        });
      }
    }
  } finally {
    client.release();
  }
};

exports.getUnseenNotificationIds = async (curUserId) => {
  const client = await pool.connect();

  try {
    const notifications = await client.query(
      'SELECT notification_id FROM notifications WHERE notified_user_id = $1 AND viewed = false GROUP BY notification_id;',
      [curUserId],
    );

    return notifications;
  } finally {
    client.release();
  }
};
