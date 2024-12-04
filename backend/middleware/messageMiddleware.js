const catchAsync = require('../utils/catchAsync');
const messageModel = require('../models/messageModel');
const AppError = require('../utils/appError');

exports.checkForChatId = catchAsync(async (req, res, next) => {
  let chatId = req.body.chatId;

  try {
    if (!chatId) {
      const { senderId, receiverId } = req.params;
      chatId = await messageModel.getChatIdBetweenUsers(senderId, receiverId);
      if (chatId) {
        const messageType = await messageModel.getMessageTypeWithId(chatId);
        req.chatId = chatId;
        req.messageType = messageType;
        console.log('this is the messageType', messageType);
        return next();
      }
      const messageType = await messageModel.createChatMessageTypeByIds(
        senderId,
        receiverId,
      );
      chatId = await messageModel.createChatForUsers(
        senderId,
        receiverId,
        messageType,
      );
      console.log('this is the messageType', messageType);
      req.chatId = chatId;
      req.messageType = messageType;
      return next();
    }
    const messageType = await messageModel.getMessageTypeWithId(chatId);
    req.messageType = messageType;
    req.chatId = chatId;
    next();
  } catch (err) {
    return next(
      new AppError(`There was a problem checking for the chatIds ${err}`, 400),
    );
  }
});

exports.validateChatIds = (req, res, next) => {
  const chatIds = req.query.chatIds;

  console.log('here is the chatIds before', chatIds);

  if (!chatIds || !Array.isArray(chatIds)) {
    return res.status(400).send({ error: 'Invalid chatIds parameter' });
  }

  // Convert chatIds to array if it's a single string
  req.chatIds = Array.isArray(chatIds) ? chatIds : [chatIds];

  console.log('here are the chatIds after', chatIds);
  next();
};

exports.getAllUserChatIds = catchAsync(async (req, res, next) => {
  let chatIds;
  const curUserId = req.params.curUserId;
  try {
    chatIds = await messageModel.getAllUserChatIds(curUserId);
    req.chatIds = chatIds;
    next();
  } catch (err) {
    return next(
      new AppError(
        'There was a problem getting all the users chatIds sorry',
        err,
        400,
      ),
    );
  }
});

exports.getUserReqChatIds = catchAsync(async (req, res, next) => {
  let chatIds;
  const curUserId = req.params.curUserId;
  console.log('this is the curUserId', curUserId);
  try {
    chatIds = await messageModel.getUserReqChatIds(curUserId);
    req.chatIds = chatIds;
    next();
  } catch (err) {
    return next(
      new AppError('There was a problem getting userChatIds sorry', err, 400),
    );
  }
});

exports.getUserChatIds = catchAsync(async (req, res, next) => {
  let chatIds;
  try {
    chatIds = await messageModel.getUserChatIds(req.params.curUserId);
    req.chatIds = chatIds;
    next();
  } catch (err) {
    return next(
      new AppError('There was a problem getting userChatIds sorry', 400),
    );
  }
});

exports.checkIfGroupChat = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;
  let groupchatStatus;
  try {
    groupchatStatus = await messageModel.checkChatIdForGroupChat(chatId);
    if (!groupchatStatus) {
      return next();
    }
    return res.status(400).json({
      status: 'fail',
      message: 'This chatId is a group chat',
    });
  } catch (err) {
    return next(
      new AppError(
        'There was a problem checking to see if this chatId is a groupchat',
        400,
      ),
    );
  }
});
