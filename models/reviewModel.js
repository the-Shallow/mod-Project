const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A tour must have a review'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tours:
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to tour'],
      },
    users:
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have a user'],
      },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tours: 1, users: 1 });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'users',
    select: 'name photo',
  });
  next();
});

// reviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'users',
//         select: '-__v -passwordChangedAt',
//     });
//     next();
// });

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tours: tourId },
    },
    {
      $group: {
        _id: `$tours`,
        nRating: { $sum: 1 },
        avgRating: { $avg: `$rating` },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tours);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.tours);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
