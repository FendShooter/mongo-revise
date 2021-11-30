const { asyncCatch } = require('../helper/asyncCatch');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../helper/errorHandler');
const User = require('../models/User');
const protectedRoute = asyncCatch(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ErrorHandler('Please login to get access', 401));
  }
  //token verification

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded._id }).select([
    '-tokens',
    '-password',
  ]);
  if (!user) {
    return next(new ErrorHandler(`User doesn't exist`, 404));
  }
  // check if user changed the password after the token has been provided
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new ErrorHandler('User recenrly changed password', 401));
  }
  req.user = user;
  next();
});

module.exports = { protectedRoute };
