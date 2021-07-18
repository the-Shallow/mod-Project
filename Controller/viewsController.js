const Booking = require('../models/bookingsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1> Get Tour Data
  const tours = await Tour.find();

  // 2> Build the template

  res.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with this name', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = catchAsync((req, res, next) => {
  res
    .status(200)
    .render('login', {
      title: 'Login into your Account',
    });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .render('signup', {
      title: 'Sign Up your Account',
    });
});

exports.getAccount = catchAsync((req, res, next) => {
  res.status(200).render('account', {
    title: 'Account Page',
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatadUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Account Page',
    user: updatadUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1> Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2> Find tours with returned IDs
  const tourID = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourID } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
