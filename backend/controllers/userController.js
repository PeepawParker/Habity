const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const userModel = require('../models/userModel');
const messageModel = require('../models/messageModel');

exports.getUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const user = await userModel.getUserByUsername(username);

  if (!user) {
    return next(new AppError('No user found with that username', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.patchUsername = catchAsync(async (req, res, next) => {
  const newUsername = req.body.newUsername;
  const username = req.body.username;

  try {
    await userModel.patchUsername(newUsername, username);
  } catch (err) {
    return next(
      new AppError('There was a problem patching the username sorry', 400),
    );
  }

  res.status(200).json({
    status: 'success',
    data: 'YOU DID IT?',
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    await userModel.deleteUser(username, password);
  } catch (err) {
    return next(
      new AppError('There was a problem deleting this user sorry', 400),
    );
  }

  res.status(200).json({
    status: 'success',
    data: 'user Deleted',
  });
});

exports.searchUsersToMessage = catchAsync(async (req, res, next) => {
  const { search, curUserId } = req.params;

  let searchedUsers;

  try {
    searchedUsers = await userModel.getUsersToMessage(search, curUserId);
  } catch (err) {
    return next(
      new AppError(
        `There was a problem fetching users to message, ${err}`,
        404,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: searchedUsers,
  });
});

exports.checkUsersChatId = catchAsync(async (req, res, next) => {
  const { curUserId, userId } = req.params;

  let chatId;

  try {
    chatId = await messageModel.getChatIdBetweenUsers(curUserId, userId);
  } catch (err) {
    return next(
      new AppError(`There was a problem checking users chatId, ${err}`, 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: chatId,
  });
});

exports.searchFollows = catchAsync(async (req, res, next) => {
  const { search, curUserId } = req.params;

  let topFollows;

  try {
    topFollows = await userModel.getTopFollows(search, curUserId);
  } catch (err) {
    return next(
      new AppError(`There was a problem fetching followedUsers, ${err}`, 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: topFollows,
  });
});

exports.searchUsername = catchAsync(async (req, res, next) => {
  const search = req.params.search;
  const curUserId = req.params.curUserId;
  let topUsers;

  try {
    topUsers = await userModel.getTopUser(search, curUserId);
  } catch (err) {
    return next(
      new AppError('There was a problem fetching searchedUsers', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: topUsers,
  });
});

exports.getMessageReqStatus = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let messageReqStatus;

  try {
    messageReqStatus = await userModel.getMessageReqStatusById(curUserId);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem fetching the MessageReqStatus for using the userId',
        404,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: messageReqStatus,
  });
});

exports.getUserWithCookie = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = decodedToken.id;

    let user;

    try {
      user = await userModel.getUserById(userId);
    } catch (error) {
      return next(
        new AppError('Something went wrong with getUserById request', 500),
      );
    }

    if (!user) return next(new AppError('No user found with that id', 404));

    res.status(200).json({
      status: 'success',
      data: user,
    });
  });
});

exports.handleAccountPrivacy = catchAsync(async (req, res, next) => {
  const userId = req.body.userId;
  try {
    await userModel.togglePrivacy(userId);
  } catch (err) {
    return next(
      new AppError(
        'Something went wrong with altering account privacy please try again later',
        500,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.getAccountPrivacy = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  let privacyStatus;
  try {
    privacyStatus = await userModel.getUserPrivacyById(userId);
  } catch (err) {
    return next(
      new AppError(
        'Something went wrong trying to retrieve this users privacy settings please try again later',
        500,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: privacyStatus,
  });
});
