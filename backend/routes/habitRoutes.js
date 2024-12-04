const express = require('express');
const habitController = require('../controllers/habitController');
const userHabitsController = require('../controllers/userHabitsController');
const habitDataController = require('../controllers/habitDataController');
const userHabitMiddleware = require('../middleware/userHabitMiddleware');
const habitDataMiddleware = require('../middleware/habitDataMiddleware');

const router = express.Router();

// http://localhost:5173/api/v1/habits/data

// eventually put a like private check to see if they want their data shown
router.get('/user/:username', habitController.getHabit);
router.post(
  '/',
  habitController.postHabit,
  userHabitMiddleware.checkNewUserHabit,
  userHabitsController.postUserHabit,
  habitDataController.postHabitData,
);

router.get('/userHabitRow', userHabitsController.getUserHabitRow);
router.get('/habitData', habitDataController.getHabitData);
router.get('/habit/lastDataPoint', habitDataController.getLastHabitDataPoint);

router
  .route('/data')
  .post(
    habitDataMiddleware.checkNewHabitData,
    habitDataController.postHabitData,
  );

router.get('/habitData/:numReturned', habitDataController.getLastNumDataPoints);

router.post('/fillMissingData', habitDataController.postMissingDataPoints);

router.delete('/delete', userHabitsController.deleteUserHabit);

module.exports = router;
