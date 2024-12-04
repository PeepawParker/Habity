const express = require('express');

const messageController = require('../controllers/messageController');
const messageMiddleware = require('../middleware/messageMiddleware');

const router = express.Router();

router
  .route('/sendMessage/:senderId/:receiverId')
  .post(messageMiddleware.checkForChatId, messageController.messageUsers);

router
  .route('/userMessages/:curUserId')
  .get(
    messageMiddleware.getUserChatIds,
    messageController.getRecentUserMessages,
  );

router
  .route('/userMessageReqs/:curUserId')
  .get(
    messageMiddleware.getUserReqChatIds,
    messageController.getRecentUserMessages,
  );

router.delete('/rejectChatReq/:chatId', messageController.rejectChatReq);

router.get(
  '/getUserMessages/:chatId/:curUserId',
  messageController.getChatIdMessages,
);
router.get('/getUserMessage/:chatId', messageController.getRecentChatMessage);
router.get('/getUserIds/:chatId', messageController.getUserIdsFromChatId);
router.get(
  '/getUnreadChatMsgCounts/:curUserId',
  messageController.getAllUnreadChatMsgCounts,
);
router.get(
  '/getUnreadChatMsgReqCounts/:curUserId',
  messageController.getAllUnreadChatMsgReqCounts,
);
router.get('/checkIfGroupChat/:chatId', messageController.checkIfGroupChat);
router.get(
  '/newMessages/:curUserId',
  messageMiddleware.getAllUserChatIds,
  messageController.getUnreadMessageStatus,
);
router.get(
  '/getQueuedMessages',
  messageMiddleware.validateChatIds,
  messageController.getQueuedMessages,
);

module.exports = router;
