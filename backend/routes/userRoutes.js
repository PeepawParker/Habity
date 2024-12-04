const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const userMiddleware = require('../middleware/userMiddleware');

const router = express.Router();

router.post('/signup', userMiddleware.checkNewUserData, authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/user/privacy', userController.handleAccountPrivacy);
router.get('/user/privacy/:userId', userController.getAccountPrivacy);
router.get('/searchUsers/:search/:curUserId', userController.searchUsername);
router.get(
  '/searchUsers/message/:search/:curUserId',
  userController.searchUsersToMessage,
);
router.get('/searchFollows/:search/:curUserId', userController.searchFollows);
router.get('/check/chatId/:curUserId/:userId', userController.checkUsersChatId);
router.get('/messageRequest/:curUserId', userController.getMessageReqStatus);

// have this to see if it should display the follow button
// .get(userController.checkFollowStatus);

router
  .route('/user')
  .get(userController.getUserWithCookie)
  .post(authController.protect, userController.getUser)
  .patch(userController.patchUsername)
  .delete(userController.deleteUser);

module.exports = router;
