const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const habitModel = require('../models/habitModel');
const userModel = require('../models/userModel');

exports.getHabit = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  let user;
  try {
    user = await userModel.getUserByUsername(username);
  } catch (err) {
    return next(
      new AppError(
        'There was an error adding this habit please try again later',
        404,
      ),
    );
  }

  if (!user) {
    return next(
      new AppError(
        'There was an error adding this habit please try again later',
        404,
      ),
    );
  }
  let userHabits;

  try {
    userHabits = await habitModel.getUserHabits(user.user_id);
  } catch (err) {
    return next(new AppError('There was an error retrieving userHabits', 500));
  }

  res.status(200).json({
    status: 'success',
    data: userHabits,
  });
});

exports.postHabit = catchAsync(async (req, res, next) => {
  const habitName = req.body.habitName;
  const variableTracking = req.body.variableTracking;

  const habitExists = await habitModel.getHabitByNameAndVar(
    habitName,
    variableTracking,
  );

  if (habitExists) {
    req.habitId = habitExists.habit_id;
    return next();
  }

  try {
    const habit = await habitModel.postHabit(habitName, variableTracking);

    req.habitId = habit.habit_id;
    return next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Unable to create habit, please try again later.',
      error: err.message,
    });
  }

  // This will then lead to making the userHabits which has to happen after a user makes a new habit which is why its next and not returning a response yet
});
