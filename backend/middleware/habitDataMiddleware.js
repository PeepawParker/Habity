const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const habitDataModel = require('../models/habitDataModel');
const userModel = require('../models/userModel');
const habitModel = require('../models/habitModel');
const userHabitModel = require('../models/userHabitModel');

exports.checkNewHabitData = catchAsync(async (req, res, next) => {
  // Check all inputs
  const userName = req.body.userName;
  const habitName = req.body.habitName;
  const habitVar = req.body.habitVar;
  const progress = req.body.progress;
  const date = new Date().toISOString().split('T')[0];
  req.date = date;

  const user = await userModel.getUserByUsername(userName);
  if (!user) {
    return next(
      new AppError(
        'There was an error inputing data please log out and log back in if this persists',
        404,
      ),
    );
  }
  const habit = await habitModel.getHabitByNameAndVar(habitName, habitVar);

  if (!habit) {
    return next(
      new AppError(
        'This habit no longer exists please refresh your window',
        404,
      ),
    );
  }
  const userHabit = await userHabitModel.getUserHabitByIds(
    user.user_id,
    habit.habit_id,
  );

  if (!userHabit) {
    return next(
      new AppError(
        'There was a problem inputing your data please try again later',
        404,
      ),
    );
  }

  const userHabitId = userHabit.user_habit_id;

  if (
    !userName ||
    !habitName ||
    !habitVar ||
    !progress ||
    !date ||
    !userHabitId
  ) {
    return res
      .status(400)
      .json({ error: 'Please ensure all inputs are filed out' });
  }

  const dataExists = await habitDataModel.getDataByDate(date, userHabitId);

  if (dataExists.rows.length > 0) {
    req.request = 'patch';
    console.log(dataExists.rows[0].data_id);
    req.dataId = dataExists.rows[0].data_id;
  } else {
    req.request = 'post';
    req.habitId = dataExists.data_id;
  }

  req.userHabitId = userHabitId;

  next();
});
