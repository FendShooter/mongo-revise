const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../helper/errorHandler');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    index: true,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    index: true,
    required: [true, 'email field is required , Please enter'],
    lowercase: true,
  },
  password: {
    trim: true,
    index: true,
    required: true,
    type: String,
    minlength: [8, 'password field needs 8 charac min'],
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['admin', 'user', 'publisher'],
    default: 'user',
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.generateAuthToken = async function (res) {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 1 * 2 * 60 * 60 * 1000),
    httpOnly: true,
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.changePasswordAfter = function (JWTTimesStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = +this.passwordChangedAt.getTime() / 1_000;
    console.log(JWTTimesStamp < changedTimeStamp);
    return JWTTimesStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.forgotPassword = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 + 60 * 1000;
  return resetToken;
};
userSchema.statics.credentials = async (name, password) => {
  const user = await User.findOne({ name });
  if (!user) {
    throw new ErrorHandler('name no  found', 400);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ErrorHandler('password no  found', 400);
  }
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
