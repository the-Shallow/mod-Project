const express = require('express');
const viewsController = require('./../Controller/viewsController');
const authController = require('./../Controller/authController');
const bookingController = require('./../Controller/bookingController');

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get(
  '/createTour',
  authController.isLoggedIn,
  viewsController.getCreateTour
);
//localhost:3000/resetPassword/1d50e570925c7d29c5a1b0ac8ab70e0ad8f16ae6a3a1f7ca5eb2a3f382f86173
router.get('/forgotPassword', viewsController.getForgotPassword);
router.get('/resetPassword/:resetToken', viewsController.getResetPassword);
router.get(
  '/addReview',
  authController.isLoggedIn,
  viewsController.getAddReview
);

router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
