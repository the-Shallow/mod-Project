const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const handleFactory = require('./handleFactory');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

exports.getAllReview = handleFactory.getAll(Review);

exports.getReview = handleFactory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  // console.log(typeof req.params.tourId);
  // if (typeof req.params.tourId === 'string')  {
  //   const val = mongoose.Types.ObjectId(req.params.tourId);
  //   console.log(val);
  // }
  // console.log(typeof req.params.tourId);
  // console.log(req.params.tourId);
  if (!req.body.tours) req.body.tours = req.params.tourId;
  if (!req.body.users) req.body.users = req.user.id;
  next();
};

exports.createReview = handleFactory.createOne(Review);

exports.updateReview = handleFactory.updateOne(Review);

exports.deleteReview = handleFactory.deleteOne(Review);
