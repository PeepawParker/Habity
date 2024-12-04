const pool = require('../database/index');

exports.postHabitData = async (progress, date, userHabitId) => {
  const client = await pool.connect();
  try {
    const dataMade = await client.query(
      'INSERT INTO habit_data (progress, date, user_habit_id) VALUES ($1, $2, $3) RETURNING *',
      [progress, date, userHabitId],
    );

    if (dataMade) return dataMade.rows[0];
  } finally {
    client.release();
  }
};

exports.patchHabitData = async (dataId, updatedProgress) => {
  const client = await pool.connect();

  try {
    const patchedData = await client.query(
      'UPDATE habit_data SET progress = $1 WHERE data_id = $2 RETURNING *',
      [updatedProgress, dataId],
    );
    return patchedData.rows[0];
  } finally {
    client.release();
  }
};

exports.getDataByDate = async (date, userHabitId) => {
  const client = await pool.connect();

  try {
    const dataExists = await client.query(
      'SELECT * FROM habit_data WHERE date = $1 AND user_habit_id = $2',
      [date, userHabitId],
    );
    if (dataExists) return dataExists;
  } finally {
    client.release();
  }
};

exports.getAllHabitData = async (userHabitIds) => {
  const client = await pool.connect();
  try {
    const dataPoints = await client.query(
      'SELECT * FROM habit_data WHERE user_habit_id = ANY($1)',
      [userHabitIds],
    );
    return dataPoints.rows;
  } finally {
    client.release();
  }
};

exports.getLastNumDataPoints = async (userHabitId, numReturned) => {
  const client = await pool.connect();
  try {
    const habitData = await client.query(
      'WITH total_count AS (SELECT COUNT(*) AS cnt FROM habit_data WHERE user_habit_id = $1) SELECT * FROM habit_data WHERE user_habit_id = $1 ORDER BY created_at ASC, data_id ASC LIMIT $2 OFFSET GREATEST((SELECT cnt FROM total_count) - $2, 0);',
      [userHabitId, numReturned],
    );
    return habitData.rows;
  } finally {
    client.release();
  }
};

exports.getHabitData = async (userHabitId) => {
  const client = await pool.connect();
  try {
    const habitData = await client.query(
      'SELECT * FROM habit_data WHERE user_habit_id = $1 ORDER BY created_at ASC',
      [userHabitId],
    );
    return habitData.rows;
  } finally {
    client.release();
  }
};

exports.getLastHabitDataPoint = async (userHabitId) => {
  const client = await pool.connect();
  try {
    const dataPoint = await client.query(
      'SELECT * FROM habit_data WHERE user_habit_id = $1 ORDER BY created_at DESC, data_id DESC LIMIT 1',
      [userHabitId],
    );
    return dataPoint.rows;
  } finally {
    client.release();
  }
};

exports.postQuery = async (sqlQuery) => {
  const client = await pool.connect();
  try {
    await client.query(sqlQuery);
  } finally {
    client.release();
  }
};
