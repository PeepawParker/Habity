class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // the parent is the error class which accepts a message argument

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // we can use this to check if the error is an operational error, and if it is then the middleware will go through it and if it isnt then it wont allowing a more controlled resposne to the user

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
