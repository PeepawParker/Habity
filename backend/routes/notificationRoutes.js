const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/get/:curUserId', notificationController.getAllNotifications);
router.get(
  '/getIds/:curUserId',
  notificationController.getUnseenNotificationIds,
);
router.get(
  '/getCount/unseen/:curUserId',
  notificationController.getCountUnseenNotifications,
);
router.get(
  '/getCount/unseen/chats/:curUserId',
  notificationController.getCountUnseenChats,
);

module.exports = router;
