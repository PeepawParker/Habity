const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const userModel = require('../models/userModel');

exports.checkNewUserData = catchAsync(async (req, res, next) => {
  // Username must be unique
  // Password must be 8 characters or longer
  // PasswordConfirm === Password
  // Email must be unique
  const username = req.body.username;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  const email = req.body.email;

  // Confirms Data can be used in DB
  if (password.length < 8) {
    return next(
      new AppError('Password must be atleast 8 characters long', 400),
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError(
        'Your password did not match the password confirm please try again',
        409,
      ),
    );
  }

  const existingUsername = await userModel.getUserByUsername(username);
  if (existingUsername) {
    return next(new AppError('A user with this username already exists', 409));
  }

  const existingEmail = await userModel.getUserByEmail(email);
  if (existingEmail) {
    return next(
      new AppError('An account has already been created using this email', 409),
    );
  }

  req.newUser = { username, password, email };
  next();
});

exports.checkChatId = catchAsync(async (req, res, next) => {});
