const catchAsync = require('../utils/catchAsync');
const habitDataModel = require('../models/habitDataModel');
const AppError = require('../utils/appError');

exports.postHabitData = catchAsync(async (req, res, next) => {
  let progress;
  const date = req.date;
  const userHabitId = req.userHabitId;
  let request;

  if (req.route.path === '/') {
    progress = 0;
    request = 'post';
  } else {
    progress = req.body.progress;
    request = req.request;
  }

  let dataPoint;

  try {
    if (request === 'post') {
      dataPoint = await habitDataModel.postHabitData(
        progress,
        date,
        userHabitId,
      );
    } else {
      dataPoint = await habitDataModel.patchHabitData(req.dataId, progress);
    }
  } catch (err) {
    return next(
      new AppError(`There was a problem posting habit data ${err}`, 404),
    );
  }

  res.status(201).json({
    status: 'success',
    data: dataPoint,
  });
});

exports.getLastNumDataPoints = catchAsync(async (req, res, next) => {
  const { userHabitId } = req.query;
  const numReturned = parseInt(req.params.numReturned, 10);
  let dataPoints;

  try {
    dataPoints = await habitDataModel.getLastNumDataPoints(
      userHabitId,
      numReturned,
    );
  } catch (err) {
    return next(
      new AppError(`There was a problem posting habit data ${err}`, 404),
    );
  }

  const dataPointsByHabit = dataPoints.reduce((acc, point) => {
    if (!acc[point.user_habit_id]) {
      acc[point.user_habit_id] = {};
    }

    const dateStr = point.date.toISOString().split('T')[0];

    const simpleData = {
      date: dateStr,
      value: point.progress,
    };

    acc[point.user_habit_id][dateStr] = simpleData;

    return acc;
  }, {});

  res.status(201).json({
    status: 'success',
    data: dataPointsByHabit,
  });
});

exports.getHabitData = catchAsync(async (req, res, next) => {
  const { userHabitId } = req.query;

  const dataPoints = await habitDataModel.getHabitData(userHabitId);

  const dataPointsByHabit = dataPoints.reduce((acc, point) => {
    if (!acc[point.user_habit_id]) {
      acc[point.user_habit_id] = {};
    }

    const dateStr = point.date.toISOString().split('T')[0];

    const simpleData = {
      date: dateStr,
      value: point.progress,
    };

    acc[point.user_habit_id][dateStr] = simpleData;

    return acc;
  }, {});
  res.status(201).json({ status: 'success', data: dataPointsByHabit });
});

exports.getLastHabitDataPoint = catchAsync(async (req, res, next) => {
  const { userHabitId } = req.query;

  const dataPoint = await habitDataModel.getLastHabitDataPoint(userHabitId);
  res.status(201).json({ status: 'success', data: dataPoint });
});

exports.postMissingDataPoints = catchAsync(async (req, res, next) => {
  const { sqlQuery } = req.body;

  const result = await habitDataModel.postQuery(sqlQuery);

  res.status(201).json({ status: 'success', data: result });
});

// exports.getAllHabitData = catchAsync(async (req, res, next) => {
//   const { userId } = req.query;

//   const allUserHabits = await userHabitModel.getAllUserHabits(userId);
//   const userHabitIds = allUserHabits.map((habit) => habit.user_habit_id);

//   const dataPoints = await habitDataModel.getAllHabitData(userHabitIds);

//   const dataPointsByHabit = dataPoints.reduce((acc, point) => {
//     if (!acc[point.user_habit_id]) {
//       acc[point.user_habit_id] = {};
//     }

//     const dateStr = point.date.toISOString().split('T')[0];

//     const simpleData = {
//       date: dateStr,
//       value: point.progress,
//     };

//     acc[point.user_habit_id][dateStr] = [simpleData];

//     return acc;
//   }, {});

//   res.status(201).json({ status: 'success', data: dataPointsByHabit });
// });
