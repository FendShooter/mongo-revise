const crypto = require('crypto');
const { asyncCatch } = require('../helper/asyncCatch');
const { ErrorHandler } = require('../helper/errorHandler');
const { sendEmail } = require('../helper/mailer');
const User = require('../models/User');

exports.allUsers = asyncCatch(async (req, res, next) => {
  const user = await User.find();
  res.status(200).send({ success: true, user });
});
exports.signup = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken(res);
    res.status(201).send({ success: true, user, token });
  } catch (error) {
    next(error);
  }
};
exports.signin = async (req, res, next) => {
  try {
    const user = await User.credentials(req.body.name, req.body.password);
    const token = await user.generateAuthToken(res);
    res.status(201).send({ success: true, user, token });
  } catch (error) {
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler('you dont have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1 - get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return new ErrorHandler('there is no user with email', 404);
  }
  // 2 - generate
  const resetToken = await user.forgotPassword();
  //  2-a
  await user.save();
  // 3 - send it to the user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/reset-password/${resetToken}`;
  const message = `Forgot your password? ${resetUrl} if you didn't make this request , please forget it`;
  const options = {
    from: 'oldhumblelion@gmail.com', // sender address
    email: 'virgile.dokouvi@outlook.com', // list of receivers
    subject: 'Train', // Subject line
    message, // plain text body
  };
  try {
    // sendEmail(options);
    res.status(200).json({ success: true, message });
  } catch (error) {
    user.passResetToken = undefined;
    user.passResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler('there was an error when send the email, ', 500)
    );
  }
};
exports.resetPassword = asyncCatch(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  const token = await user.generateAuthToken();
  console.log(token);
  console.log(user);
  // await user.save();
  res.status(200).json({ success: true, token });
});
