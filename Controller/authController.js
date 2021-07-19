const util = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
    console.log("Cookies sent over https");
  } 

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1>  check email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide eamil or password', 400));
  }
  // 2> check if user exist and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  // 3> if eveything is ohkay send the token back
  createSendToken(user, 200, res);
});

exports.logout = async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1> Getting token and check of it's true
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in.Please log in to get access.', 401)
    );
  }

  //2> Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3>check if the user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('The user with this token no longer exist.', 401));
  }

  //3>check if the user has changed password and token issued at
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user has recently changed password.Please login again',
        401
      )
    );
  }

  // Grant access to protected routes
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;

            //2> Verification token
            const decoded = await util.promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //3>check if the user still exists
            const user = await User.findById(decoded.id);

            if (!user) {
                return next();
            }

            //3>check if the user has changed password and token issued at
            if (user.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // Grant access to protected routes
            res.locals.user = user;
            return next();
        } catch (err) {
            return next();
        }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('The user does not have acess to this priviledge', 403)
      );
    }

    next();
  };
};

exports.forgotpassword = catchAsync(async (req, res, next) => {
  //1> Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2> generate a random token
  const resetToken = user.changedPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1>Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2>if token has not expired and user exist set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3>Update changedpasswordAt property

  //4>Log in the user send the jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1>Get User from collections
  const user = await User.findById(req.user.id).select('+password');

  // 2> Check if the password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('The password is not valid.Try again', 401));
  }
  // 3> If so , update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate() would not work as intended. userModel middleware and validations would not work

  // 4> login the user send jwt
  createSendToken(user, 200, res);
});
