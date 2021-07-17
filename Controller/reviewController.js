const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const handleFactory = require('./handleFactory');

exports.getAllReview = handleFactory.getAll(Review);

exports.getReview = handleFactory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tours) req.body.tours = req.params.tourId;
  if (!req.body.users) req.body.users = req.user.id;
  next();
};

exports.createReview = handleFactory.createOne(Review);

exports.updateReview = handleFactory.updateOne(Review);

exports.deleteReview = handleFactory.deleteOne(Review);
