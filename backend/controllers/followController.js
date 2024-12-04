const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const followModel = require('../models/followModel');
const notificationModel = require('../models/notificationModel');

// params (https://user/:variable)

// people following the user
exports.getFollowers = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  let result;

  try {
    result = await followModel.getFollowersByUsername(username);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem retrieving the followers please try again later',
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// people the user is following
exports.getFollowing = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  let result;

  try {
    result = await followModel.getFollowingByUsername(username);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem retrieving the followed users please try again later',
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.followPrivateUser = catchAsync(async (req, res, next) => {
  const followerId = req.body.followerId;

  if (followerId === 'null') {
    return next(new AppError('Please Log back in', 404));
  }

  const followedId = req.body.followedId;
  if (followedId === 'null') {
    return next(new AppError('This user no longer exists', 404));
  }
  console.log('private', followerId, followedId);
  const followStatus = await followModel.friendPrivateUser(
    followerId,
    followedId,
  );

  if (!followStatus.success) {
    return next(
      new AppError(
        `The person you friended no longer exists ${followStatus.error}`,
        404,
      ),
    );
  }

  await notificationModel.postNotification(
    followedId,
    followerId,
    'FollowPrivateReq',
  );

  res.status(200).json({
    status: 'success',
  });
});

exports.followUser = catchAsync(async (req, res, next) => {
  const followerId = req.body.followerId;

  if (followerId === 'null') {
    return next(new AppError('Please Log back in', 404));
  }

  const followedId = req.body.followedId;

  if (followedId === 'null') {
    return next(new AppError('This user no longer exists', 404));
  }

  console.log('here are the values that get sent', followerId, followedId);

  const followStatus = await followModel.friendUser(followerId, followedId);

  if (!followStatus.success) {
    return next(
      new AppError(
        `The person you friended no longer exists ${followStatus.error}`,
        404,
      ),
    );
  }

  await notificationModel.postNotification(
    followedId,
    followerId,
    'FollowPublic',
  );

  res.status(200).json({
    status: 'success',
  });
});

exports.acceptFollowRequest = catchAsync(async (req, res, next) => {
  const { followerId, followedId } = req.body;
  let result;
  try {
    result = await followModel.acceptFriendReq(followerId, followedId);
  } catch (err) {
    return next(
      new AppError(
        `There was a problem accepting the friend request please try again later ${err}`,
        500,
      ),
    );
  }

  if (!result.success) {
    return next(
      new AppError(
        `something went wrong accepting the friend request. Error: ${result.error}`,
        500,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.getFollowReq = catchAsync(async (req, res, next) => {
  const followerId = req.params.followerId;
  const followedId = req.params.followedId;
  let followReq;
  try {
    followReq = await followModel.getFollowReq(followerId, followedId);
  } catch (err) {
    return next(
      new AppError(`There was a problem getting the req status ${err}`, 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: followReq,
  });
});

exports.getFollowStatus = catchAsync(async (req, res, next) => {
  const loggedInUsername = req.params.loggedInUsername;
  const username = req.params.username;

  let friendStatus;

  try {
    friendStatus = await followModel.getFollowerByUsername(
      loggedInUsername,
      username,
    );
  } catch (err) {
    return next(
      new AppError(`There was a problem getting the friend status ${err}`, 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: friendStatus[0].exists,
  });
});

exports.unfollowUser = catchAsync(async (req, res, next) => {
  const followerId = req.params.followerId;
  const followedId = req.params.followedId;

  let unfollowStatus;

  try {
    unfollowStatus = await followModel.deleteFollow(followerId, followedId);
  } catch (err) {
    return next(
      new AppError(`There was a problem unfriending user ${err}`, 404),
    );
  }

  if (!unfollowStatus.success) {
    return next(
      new AppError(
        `The person you friended no longer exists ${unfollowStatus.error}`,
        404,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.rejectFollowRequest = catchAsync(async (req, res, next) => {
  const followerId = req.params.followerId;
  const followedId = req.params.followedId;

  console.log('we are in here');

  let rejectReqStatus;
  try {
    rejectReqStatus = await followModel.deleteFollowRequest(
      followerId,
      followedId,
    );
  } catch (err) {
    return next(
      new AppError(`There was a problem rejecting the request ${err}`, 500),
    );
  }

  if (!rejectReqStatus.success) {
    return next(
      new AppError(
        `The persons request you rejected no longer exists ${rejectReqStatus.error}`,
        404,
      ),
    );
  }

  res.status(200).json({ status: 'success' });
});

exports.getFollowCountsAndIds = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;

  let followCounts;
  let followingIdsArray;

  try {
    followCounts = await followModel.getFollowCountsById(curUserId);
    followingIdsArray = await followModel.getFollowingIdsById(curUserId);
  } catch (err) {
    return next(
      new AppError(`There was a problem getting follower counts ${err}`, 500),
    );
  }

  const followingIds = followingIdsArray.reduce((acc, obj) => {
    acc[obj.followed_id] = obj;
    return acc;
  }, {});

  console.log(
    followCounts.followerCount.count,
    followCounts.followingCount.count,
  );

  res.status(200).json({
    status: 'success',
    data: {
      followerCount: followCounts.followerCount.count,
      followingCount: followCounts.followingCount.count,
      followingIds,
    },
  });
});
