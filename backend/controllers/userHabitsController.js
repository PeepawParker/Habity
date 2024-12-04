const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const userHabitModel = require('../models/userHabitModel');
const AppError = require('../utils/appError');

exports.postUserHabit = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const userId = decoded.id;
  const habitId = req.habitId;
  const startDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const habitName = req.body.habitName;
  const variableTracking = req.body.variableTracking;
  const dailyGoal = req.body.dailyGoal;

  const newUserHabit = await userHabitModel.postUserHabit(
    userId,
    habitId,
    startDate,
    habitName,
    variableTracking,
    dailyGoal,
  );
  req.userHabitId = newUserHabit.user_habit_id;
  req.date = newUserHabit.start_date;

  if (!newUserHabit) {
    return next(
      new AppError(
        'uh oh was a problem connecting your account to this habit please try again later',
        500,
      ),
    );
  }

  next();
});

exports.getUserHabitRow = catchAsync(async (req, res, next) => {
  const { userHabitId } = req.query;

  const userHabitRow =
    await userHabitModel.getUserHabitByUserHabitId(userHabitId);

  if (!userHabitRow) {
    return next(
      new AppError(
        "something went wrong in the getUserHabitRow that definitly shouldn't have",
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: userHabitRow,
  });
});

exports.deleteUserHabit = catchAsync(async (req, res, next) => {
  const { userHabitId } = req.body;

  try {
    await userHabitModel.deleteUserHabit(userHabitId);
  } catch (err) {
    return next(new AppError(`No habit found with the given ID.`, 404));
  }
  res.status(200).json({ status: 'success' });
});

exports.getVisitorHabitData = catchAsync(async (req, res, next) => {});
