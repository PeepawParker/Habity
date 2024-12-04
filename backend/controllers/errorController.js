module.exports = (err, req, res, next) => {
  console.log('an error has occured !!!');
  console.log(err.status, err.message, err);
  // Your error handling logic here
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
  });
};
