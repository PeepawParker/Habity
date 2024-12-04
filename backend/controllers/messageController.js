const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const messageModel = require('../models/messageModel');

exports.getRecentUserMessages = catchAsync(async (req, res, next) => {
  const chatIds = req.chatIds;
  const curUserId = req.params.curUserId;

  if (chatIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      messages: [],
    });
  }

  let messages;
  try {
    messages = await messageModel.getAllRecentUserMessages(chatIds, curUserId);
  } catch (err) {
    return next(new AppError(`There was a problem getting past chats`, err));
  }

  res.status(200).json({
    status: 'success',
    messages,
  });
});

exports.checkIfGroupChat = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;

  let groupChatStatus;

  try {
    groupChatStatus = await messageModel.checkIfGroupChat(chatId);
  } catch (err) {
    return next(
      new AppError(`There was a problem checking if chat was a groupchat`, err),
    );
  }

  res.status(200).json({
    status: 'success',
    groupChatStatus,
  });
});

exports.getRecentChatMessage = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;

  let recentMessage;

  try {
    recentMessage = await messageModel.getRecentChatMessage(chatId);
  } catch (err) {
    return next(
      new AppError(`There was a problem getting most recent chat message`, err),
    );
  }

  res.status(200).json({
    status: 'success',
    recentMessage,
  });
});

exports.getUserIdsFromChatId = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;
  let userIds;

  try {
    userIds = await messageModel.getUserIdsFromChatId(chatId);
  } catch (err) {
    return next(
      new AppError(`There was a problem getting this chats userIds`, err),
    );
  }

  res.status(200).json({
    status: 'success',
    userIds,
  });
});

exports.getChatIdMessages = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;
  const curUserId = req.params.curUserId;
  let pastMessages;

  try {
    pastMessages = await messageModel.viewChatMessagesById(chatId, curUserId);
  } catch (err) {
    return next(
      new AppError(
        `There was a problem getting this chats message history`,
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    messages: pastMessages,
  });
});

exports.messageUsers = catchAsync(async (req, res, next) => {
  const chatId = req.chatId;
  const messageType = req.messageType;
  const { senderId, receiverId } = req.params;
  const { message, isMessageReq } = req.body;
  // if isMessageReq is true that means that this is the user that is making this a message request and that if they respond it should turn the chat to a normal chat

  try {
    if (isMessageReq) {
      const { timeSent, messageId, otherUserId } =
        await messageModel.replyToMessageRequest(
          message,
          senderId,
          receiverId,
          chatId,
        );
      const returnedObject = { timeSent, messageId, chatId, otherUserId };
      res.status(200).json({
        status: 'success',
        returnedObject,
      });
    } else {
      const { timeSent, messageId, otherUserId } =
        await messageModel.postMessageBetweenUsers(
          message,
          senderId,
          receiverId,
          chatId,
          messageType,
        );

      const returnedObject = { timeSent, messageId, chatId, otherUserId };
      res.status(200).json({
        status: 'success',
        returnedObject,
      });
    }
  } catch (err) {
    return next(new AppError(`There was a problem posting this message`, err));
  }
});

exports.createChat = catchAsync(async (req, res, next) => {
  // This will be called when a user explicitly creates a groupchat
});

exports.getAllUnreadChatMsgCounts = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let unreadChatMsgCounts;

  try {
    const chatIds = await messageModel.getUserChatIds(curUserId);
    unreadChatMsgCounts = await messageModel.getUnreadChatMsgCountsByChatId(
      chatIds,
      curUserId,
    );
  } catch (err) {
    return next(
      new AppError(
        `There was a problem getting this users unread chat messages`,
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    unreadChatMsgCounts,
  });
});

exports.getAllUnreadChatMsgReqCounts = catchAsync(async (req, res, next) => {
  const curUserId = req.params.curUserId;
  let unreadChatMsgReqCounts;

  try {
    const chatIds = await messageModel.getUserReqChatIds(curUserId);
    unreadChatMsgReqCounts =
      await messageModel.getUnreadChatMsgReqCountsByChatId(chatIds, curUserId);
  } catch (err) {
    return next(
      new AppError(
        `There was a problem getting this users unread chat message requests`,
        err,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    unreadChatMsgReqCounts,
  });
});

exports.getQueuedMessages = catchAsync(async (req, res, next) => {
  const chatIds = req.chatIds;
  let messages;

  console.log('here are the chatIds and messages', chatIds);

  try {
    messages = await messageModel.getRecentMessagesByChatIds(chatIds);
  } catch (err) {
    return next(
      new AppError(`There was a problem getting queued messages`, err),
    );
  }

  res.status(200).json({
    status: 'success',
    data: messages,
  });
});

exports.getUnreadMessageStatus = catchAsync(async (req, res, next) => {
  const chatIds = req.chatIds;
  const curUserId = req.params.curUserId;

  const unreadStatus = { message: false, req: false };
  let result;

  try {
    result = await messageModel.checkUnreadMessageStatus(curUserId, chatIds);
  } catch (err) {
    return next(
      new AppError(
        `There was a problem checking for users unreadMessages`,
        err,
      ),
    );
  }

  unreadStatus.message = result[1].row_exists;
  unreadStatus.req = result[0].row_exists;

  console.log('here is the result', unreadStatus);
  res.status(200).json({
    status: 'success',
    data: unreadStatus,
  });
});

exports.rejectChatReq = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;

  try {
    await messageModel.deleteChatAndMessagesByChatId(chatId);
  } catch (err) {
    return next(
      new AppError(`There was a problem rejecting this chat request`, err),
    );
  }

  res.status(200).json({
    status: 'success',
  });
});
