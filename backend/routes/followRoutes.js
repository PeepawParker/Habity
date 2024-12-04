const express = require('express');
const followController = require('../controllers/followController');

const router = express.Router();

router.get('/Following/:username', followController.getFollowing);
router.get('/Followers/:username', followController.getFollowers);
router.post('/followUser', followController.followUser);
router.post('/followPrivateUser', followController.followPrivateUser);
router.post('/acceptFollowRequest', followController.acceptFollowRequest);

router.get(
  '/privateUser/:followerId/:followedId',
  followController.getFollowReq,
);
router.delete(
  '/rejectReq/:followerId/:followedId',
  followController.rejectFollowRequest,
);
router.delete(
  '/unfollowUser/:followerId/:followedId',
  followController.unfollowUser,
);
router.get(
  '/status/:loggedInUsername/:username',
  followController.getFollowStatus,
);

router.get('/count/:curUserId', followController.getFollowCountsAndIds);

module.exports = router;
