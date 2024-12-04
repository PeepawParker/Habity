const pool = require('../database/index');
const AppError = require('../utils/appError');

exports.getUserHabits = async (userId) => {
  const client = await pool.connect();
  try {
    const habits = await client.query(
      'SELECT * FROM user_habits WHERE user_id = $1',
      [userId],
    );
    return habits.rows;
  } finally {
    client.release();
  }
};

exports.getHabitByName = async (habitName) => {
  const client = await pool.connect();
  try {
    const habit = await client.query(
      'SELECT * FROM habits WHERE habit_name = $1',
      [habitName],
    );
    return habit.rows.length > 0 ? habit.rows : null;
  } finally {
    client.release();
  }
};

exports.getHabitByNameAndVar = async (habitName, varTracked) => {
  const client = await pool.connect();
  try {
    const habit = await client.query(
      'SELECT * FROM habits WHERE habit_name = $1 AND variable_tracked = $2',
      [habitName, varTracked],
    );
    return habit.rows[0];
  } finally {
    client.release();
  }
};

exports.postHabit = async (habitName, varTracked) => {
  const client = await pool.connect();
  try {
    const habitMade = await client.query(
      'INSERT INTO habits (habit_name, variable_tracked) VALUES ($1, $2) RETURNING *',
      [habitName, varTracked],
    );
    if (habitMade) {
      return habitMade.rows[0];
    }
  } finally {
    client.release();
  }
};
