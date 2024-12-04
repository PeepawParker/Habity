const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const { server } = require('./app');
const pool = require('./database/index');

const port = process.env.PORT || 5000;

// Database connection check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log(
      'Database connection successful. Server time is:',
      res.rows[0].now,
    );
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
