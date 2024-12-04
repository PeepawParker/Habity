const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const userHabitModel = require('../models/userHabitModel');

exports.checkNewUserHabit = catchAsync(async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const habitId = req.habitId;

    const userHabit = await userHabitModel.getUserHabitByIds(userId, habitId);

    if (userHabit) {
      return next(
        new AppError(
          'You are already tracking this habit, try tracking something new !',
        ),
      );
    }
    next();
  } catch (err) {
    console.error('Error checking user habit:', err);
    next(); // Proceed if the habit does not exist}
  }
});
