const pool = require('../database/index');

exports.postUserHabit = async (
  userId,
  habitId,
  startDate,
  habitName,
  variableTracking,
  dailyGoal,
) => {
  const client = await pool.connect();

  try {
    const userHabitMade = await client.query(
      'INSERT INTO user_habits (user_Id, habit_id, start_date, habit_name, variable_tracked, daily_goal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_habit_id, start_date, daily_goal, habit_name, variable_tracked',
      [userId, habitId, startDate, habitName, variableTracking, dailyGoal],
    );
    if (userHabitMade) return userHabitMade.rows[0];
  } finally {
    client.release();
  }
};

exports.getUserHabitByIds = async (userId, habitId) => {
  const client = await pool.connect();

  try {
    const userHabit = await client.query(
      'SELECT * FROM user_habits WHERE user_id = $1 AND habit_id = $2',
      [userId, habitId],
    );
    return userHabit.rows[0];
  } finally {
    client.release();
  }
};

exports.getUserHabitByUserHabitId = async (userHabitId) => {
  const client = await pool.connect();

  try {
    const userHabitRow = await client.query(
      'SELECT * FROM user_habits WHERE user_habit_id = $1',
      [userHabitId],
    );
    return userHabitRow.rows[0];
  } finally {
    client.release();
  }
};

exports.getAllUserHabits = async (userId) => {
  const client = await pool.connect();

  try {
    const userHabits = await client.query(
      'SELECT * FROM user_habits WHERE user_id = $1',
      [userId],
    );
    return userHabits.rows;
  } finally {
    client.release();
  }
};

exports.deleteUserHabit = async (userHabitId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // First, delete the habit data
    const dataDeleteResult = await client.query(
      'DELETE FROM habit_data WHERE user_habit_id = $1',
      [userHabitId],
    );

    // Then, delete the user habit
    const habitDeleteResult = await client.query(
      'DELETE FROM user_habits WHERE user_habit_id = $1',
      [userHabitId],
    );

    await client.query('COMMIT'); // Commit the transaction if all queries succeeded

    return { dataDeleteResult, habitDeleteResult, success: true };
  } finally {
    client.release();
  }
};
