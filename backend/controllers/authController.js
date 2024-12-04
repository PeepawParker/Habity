const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');

const userModel = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.user_id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // 90 days
    ),
    httpOnly: true,
    // I changed this from laxx if there are some problems
    sameSite: 'strict',
    path: '/',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// All JWT stuff will basically be handled exclusively in here

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  const user = !username
    ? await userModel.getUserByEmail(email)
    : await userModel.getUserByUsername(username);

  if (!user) {
    return next(new AppError('User Does not exist'));
  }

  const correctPassword = await bcrypt.compare(password, user.password);
  if (!correctPassword) {
    return next(new AppError('Incorrect Username/Password'));
  }
  createSendToken(user, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.newUser;
  console.log(username, email, password);

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  let newUser;

  try {
    newUser = await userModel.postNewUser({
      username,
      hashedPassword,
      email,
    });
  } catch (err) {
    return next(
      new AppError(
        'There was a problem creating a new user try again later',
        500,
      ),
    );
  }

  if (!newUser)
    return next(
      new AppError(
        'There was a problem creating a new user try again later',
        500,
      ),
    );

  createSendToken(newUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError(
        'You are not logged in please log in to gain access to this feature.',
        401,
      ),
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  let currentUser;

  try {
    currentUser = await userModel.getUserById(decoded.id);
  } catch (err) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  // if someone changes the username in redux but it doesn't match the cookie key they have they'll be met with this
  if (req.params.username !== currentUser.username) {
    return next(
      new AppError(
        'You are not authorized to access this resource with the provided username',
        403,
      ),
    );
  }

  req.user = currentUser;
  next();
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(201).json({
    status: 'success',
  });
});

// exports.restrictTo;
// // users with admin get access to things normal users dont

// exports.forgotPassword;

// exports.resetPassword;

// exports.updatePassword;
