const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const notificationModel = require('../models/notificationModel');
const messageModel = require('../models/messageModel');

//eventually make this only retrieve say the last 50 notifications and then infinitely load more
// and eventually group them up for like likes and stuff like how instagram does it where it should like 2 people + 34 more people liked your post
exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let notifications;

  try {
    notifications = await notificationModel.getAllNotificationsById(curUserId);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem retrieving the notifications please try again later',
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: notifications,
  });
});

exports.getCountUnseenChats = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let unreadChats;
  let userChatIds;

  try {
    // first need to get all chatIds that belong to the user, then use those chatIds to see how many of them have an unread message
    userChatIds = await messageModel.getUserChatIds(curUserId);
    unreadChats = await notificationModel.getCountUnseenChats(
      userChatIds,
      curUserId,
    );
  } catch (err) {
    return next(
      new AppError(
        'There was a problem retrieving the unseen chat count please try again later',
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    unreadChats,
  });
});

exports.getCountUnseenNotifications = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let count;

  try {
    count = await notificationModel.getCountUnseenNotificationsById(curUserId);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem retrieving the unseen notifications please try again later',
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    count,
  });
});

// the notification type is just going to be a string, and when I get these strings depending on the type it will have a pretyped string to put all necessary values into
exports.sendNotification = catchAsync(async (req, res, next) => {
  const { notifiedUserId, notifierUserId, notificationType } = req.body;

  try {
    await notificationModel.postNotification(
      notifiedUserId,
      notifierUserId,
      notificationType,
    );
  } catch (err) {
    return next(
      new AppError(
        'There was a problem sending notification please try again later',
        err,
      ),
    );
  }
});

exports.getUnseenNotificationIds = catchAsync(async (req, res, next) => {
  const { curUserId } = req.params;
  let result;

  try {
    result = await notificationModel.getUnseenNotificationIds(curUserId);
  } catch (err) {
    return next(
      new AppError(
        'There was a problem fetching unseen notifications try again later',
        err,
      ),
    );
  }

  const { rowCount, rows } = result;
  const notificationsObject = rows.reduce((acc, row) => {
    acc[row.notification_id] = row.notification_id;
    return acc;
  }, {});

  res.status(200).json({
    status: 'success',
    notificationIds: { rowCount, notificationsObject },
  });
});
