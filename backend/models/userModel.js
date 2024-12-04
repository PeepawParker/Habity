const pool = require('../database/index');

exports.getUserById = async (userId) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId],
    );
    return result.rows[0]; // Return user data
  } finally {
    client.release();
  }
};

exports.getUserByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

exports.getUsersToMessage = async (search, curUserId) => {
  const client = await pool.connect();
  try {
    const searchPattern = `${search}%`;

    // Modified query to fetch up to 3 users, excluding curUserId, without privacy restrictions
    const query = `
    SELECT
      u.user_id,
      u.username,
      u.follower_count,
      CASE
        WHEN f1.follower_id IS NOT NULL AND f2.followed_id IS NOT NULL THEN 0
        WHEN f1.follower_id IS NOT NULL THEN 1
        WHEN f2.followed_id IS NOT NULL THEN 2
        ELSE 3
      END AS follow_status
    FROM
      users u
    LEFT JOIN
      follows f1 ON u.user_id = f1.followed_id AND f1.follower_id = $2
    LEFT JOIN
      follows f2 ON u.user_id = f2.follower_id AND f2.followed_id = $2
    WHERE
      u.username LIKE $1
      AND u.user_id != $2
    ORDER BY
      follow_status ASC,
      u.follower_count DESC
    LIMIT 3;
    `;

    const result = await client.query(query, [searchPattern, curUserId]);
    return result.rows;
  } finally {
    client.release();
  }
};

exports.getUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const user = await client.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return user.rows[0];
  } finally {
    client.release();
  }
};

exports.postNewUser = async (newUser) => {
  const { username, hashedPassword, email } = newUser;
  const client = await pool.connect();
  try {
    const userMade = await client.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, email],
    );
    if (userMade) return userMade.rows[0];
  } finally {
    client.release();
  }
};

exports.patchUsername = async (newUsername, username) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET username = $1 WHERE username = $2',
      [newUsername, username],
    );
    return result.rowCount;
  } finally {
    client.release();
  }
};

exports.deleteUser = async (username, password) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE from users where username=$1 and password=$2',
      [username, password],
    );
    return result.rowCount;
  } finally {
    client.release();
  }
};

//I need this to get a user based on the search term but also making sure that the current user follows them

exports.getTopFollows = async (search, curUserId) => {
  const client = await pool.connect();
  try {
    const searchPattern = `%${search}%`; // Prepare the search pattern for a LIKE query
    const topFollowsQuery = `
      SELECT u.username, u.user_id as user_id
      FROM users u
      INNER JOIN follows f ON u.user_id = f.followed_id
      WHERE f.follower_id = $1 AND u.username ILIKE $2
    `;
    const topFollows = await client.query(topFollowsQuery, [
      curUserId,
      searchPattern,
    ]);
    return topFollows.rows;
  } finally {
    client.release();
  }
};

exports.getMessageReqStatusById = async (curUserId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
    SELECT EXISTS (
      SELECT 1
      FROM chat_members cm
      INNER JOIN chats c ON cm.chat_id = c.chat_id
      WHERE cm.user_id = $1 AND c.message_type = 'messageRequest'
    )`,
      [curUserId],
    );

    return result.rows[0].exists;
  } finally {
    client.release();
  }
};

// This will make it so first it checks for usernames with the letters in order, then it checks if they are in order within the name somewhere, then it finally checks if the username just contains the 2 letters

// SELECT *
// FROM users
// WHERE username LIKE '%t%' AND username LIKE '%l%'
// ORDER BY
//   CASE
//     WHEN username LIKE 't%l%' THEN 1
//     WHEN username LIKE '%t%l%' THEN 2
//     ELSE 3
//   END,
//   follower_count DESC
// LIMIT 3;

exports.getTopUser = async (userSearch, curUserId) => {
  const client = await pool.connect();
  try {
    // first retrieve the users that start with whatever the letters are. Then see if the current user is following any of them, then order them by follower count, then by account age and return the top 3 accounts
    const topUsers = await client.query(
      'SELECT username, follower_count, user_id FROM users WHERE username LIKE $1 AND user_id != $2 ORDER BY follower_count DESC LIMIT 3',
      [`%${userSearch}%`, curUserId],
    );
    return topUsers.rows;
  } finally {
    client.release();
  }
};

exports.togglePrivacy = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET private = NOT private WHERE user_id = $1 RETURNING private',
      [userId],
    );

    if (!result.rows[0].private) {
      // if account got swapped from private to public

      // Update chats
      await client.query(
        `
        UPDATE chats c
        SET message_type = 'message'
        FROM chat_members cm
        WHERE c.chat_id = cm.chat_id
          AND cm.user_id = $1
          AND c.message_type = 'messageRequest'
          AND c.private_user = $1
      `,
        [userId],
      );

      // Update messages
      await client.query(
        `
        UPDATE messages m
        SET message_type = 'message'
        FROM chats c
        JOIN chat_members cm ON c.chat_id = cm.chat_id
        WHERE m.chat_id = c.chat_id
          AND cm.user_id = $1
          AND c.message_type = 'message'
          AND m.message_type = 'messageRequest'
          AND c.private_user = $1
      `,
        [userId],
      );
    }

    return result.rows[0].private;
  } finally {
    client.release();
  }
};

exports.getUserPrivacyById = async (userId) => {
  const client = await pool.connect();
  try {
    const accountPrivacy = await client.query(
      'SELECT private FROM users WHERE user_id = $1',
      [userId],
    );
    return accountPrivacy.rows;
  } finally {
    client.release();
  }
};
