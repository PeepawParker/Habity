const pool = require('../database/index');
const { sendSSEMessage } = require('../utils/realTimeConnection/sseSetup');

exports.getFollowersByUsername = async (username) => {
  const client = await pool.connect();

  try {
    const followersResult = await client.query(
      `SELECT f.follower_username, f.follower_id, u.private 
      FROM 
        follows f 
      LEFT JOIN
        users u on f.follower_username = u.username
      WHERE followed_username = $1 AND pending_status = false`,
      [username],
    );

    const countResult = await client.query(
      'SELECT COUNT(*) FROM follows WHERE followed_username = $1 AND pending_status = false',
      [username],
    );
    const followers = followersResult.rows;
    const count = parseInt(countResult.rows[0].count, 10);

    return { followers, count };
  } finally {
    client.release();
  }
};

exports.getFollowingIdsById = async (curUserId) => {
  const client = await pool.connect();

  try {
    const followingIds = await client.query(
      `SELECT
        f.followed_id,
        f.pending_status,
        u.private
      FROM
        follows f
      LEFT JOIN
        users u on f.follower_id = u.user_id
      WHERE f.follower_id = $1`,
      [curUserId],
    );
    return followingIds.rows;
  } finally {
    client.release();
  }
};

exports.getFollowingByUsername = async (username) => {
  const client = await pool.connect();

  try {
    const followingResult = await client.query(
      'SELECT followed_username, followed_id FROM follows WHERE follower_username = $1 AND pending_status = false',
      [username],
    );

    const following = followingResult.rows;

    return { following };
  } finally {
    client.release();
  }
};

// in the notification center it will have the request and attatched to it will be the users username which I can use that or their follow id to check to make sure it exists by getting it then when its accepted it will just turn the pending status to false and update the follow counts for the parties involved
//if they decline the request it will just delete the row from the table
exports.acceptFriendReq = async (followerId, followedId) => {
  const client = await pool.connect();
  let result;
  try {
    // update follow counts
    // update notification
    await client.query('BEGIN');

    await client.query(
      'UPDATE follows SET pending_status = false WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId],
    );

    await client.query(
      'UPDATE users SET follower_count = follower_count + 1 WHERE user_id = $1',
      [followedId],
    );

    await client.query(
      'UPDATE users SET following_count = following_count + 1 WHERE user_id = $1',
      [followerId],
    );
    // swap the itds so that the user that got accepted not gets the notification
    const notification = await client.query(
      `UPDATE notifications SET notification_type = 'FollowPrivateAccept', viewed = 'false', notified_user_id = $2, notifier_user_id = $1  WHERE notified_user_id = $1 AND notifier_user_id = $2 RETURNING notification_id`,
      [followedId, followerId],
    );
    await client.query('COMMIT');

    sendSSEMessage(followerId, 'reqAccepted', {
      notificationId: notification.rows[0].notification_id,
      followedId,
    });
    result = { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    result = { success: false, error: err.message };
  } finally {
    client.release();
  }
  return result;
};

exports.friendPrivateUser = async (followerId, followedId) => {
  const client = await pool.connect();
  let result;
  try {
    await client.query(
      'INSERT INTO follows (follower_id, followed_id, pending_status) VALUES ($1, $2, true)',
      [followerId, followedId],
    );
    result = { success: true };
  } catch (err) {
    result = { success: false, error: err.message };
  } finally {
    client.release();
  }
  return result;
};

// follower = user following someone else
// followed = user that got followed
exports.friendUser = async (followerId, followedId) => {
  const client = await pool.connect();
  let result;
  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)',
      [followerId, followedId],
    );
    await client.query(
      'UPDATE users SET follower_count = follower_count + 1 WHERE user_id = $1',
      [followedId],
    );
    await client.query(
      'UPDATE users SET following_count = following_count + 1 WHERE user_id = $1',
      [followerId],
    );

    await client.query('COMMIT');

    result = { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    result = { success: false, error: err.message };
  } finally {
    client.release();
  }
  return result;
};

exports.getFollowerByUsername = async (loggedInUsername, username) => {
  const client = await pool.connect();

  try {
    const followStatus = await client.query(
      'SELECT EXISTS (SELECT 1 FROM follows WHERE follower_username = $1 AND followed_username = $2 AND pending_status = false)',
      [loggedInUsername, username],
    );
    return followStatus.rows;
  } finally {
    client.release();
  }
};

exports.deleteFollow = async (followerId, followedId) => {
  const client = await pool.connect();
  let result;
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId],
    );
    await client.query(
      'UPDATE users SET follower_count = follower_count - 1 WHERE user_id = $1',
      [followedId],
    );
    await client.query(
      'UPDATE users SET following_count = following_count - 1 WHERE user_id = $1',
      [followerId],
    );

    const notification1 = await client.query(
      `SELECT notification_id FROM notifications 
       WHERE notified_user_id = $1 AND notifier_user_id = $2`,
      [followedId, followerId],
    );

    let notificationId;
    if (notification1.rowCount === 0) {
      const notification2 = await client.query(
        `SELECT notification_id FROM notifications 
         WHERE notified_user_id = $2 AND notifier_user_id = $1 AND notification_type = 'FollowPrivateAccept'`,
        [followedId, followerId],
      );

      if (notification2.rowCount === 0) {
        return { success: true };
      }
      notificationId = notification2.rows[0].notification_id;
    } else {
      notificationId = notification1.rows[0].notification_id;
    }

    await client.query('DELETE FROM notifications WHERE notification_id = $1', [
      notificationId,
    ]);

    await client.query('COMMIT');

    if (notificationId) {
      sendSSEMessage(followedId, 'deleteFollow', {
        notificationId,
      });
      sendSSEMessage(followerId, 'deleteNotification', { notificationId });
    }

    result = { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    result = { success: false, error: err.message };
  } finally {
    client.release();
  }
  return result;
};

exports.deleteFollowRequest = async (followerId, followedId) => {
  const client = await pool.connect();
  let result;
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId],
    );

    const notificationResult = await client.query(
      'DELETE FROM notifications WHERE notified_user_id = $1 AND notifier_user_id = $2 RETURNING notification_id',
      [followedId, followerId],
    );

    await client.query('COMMIT');

    const notificationId = notificationResult.rows[0].notification_id;
    sendSSEMessage(followedId, 'deleteNotification', {
      notificationId: notificationId || 'unknown',
    });

    result = { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    result = { success: false, error: err.message };
  } finally {
    client.release();
  }
  return result;
};

exports.getFollowReq = async (followerId, followedId) => {
  const client = await pool.connect();
  try {
    const followReq = await client.query(
      'SELECT pending_status FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId],
    );
    return followReq.rows;
  } finally {
    client.release();
  }
};

exports.getFollowCountsById = async (curUserId) => {
  const client = await pool.connect();
  try {
    const followerCount = await client.query(
      'SELECT COUNT(*) FROM follows WHERE followed_id = $1 AND pending_status = false',
      [curUserId],
    );
    const followingCount = await client.query(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1 AND pending_status = false',
      [curUserId],
    );
    return {
      followerCount: followerCount.rows[0],
      followingCount: followingCount.rows[0],
    };
  } finally {
    client.release();
  }
};
