import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { addNewReview } from './addNewReview';
import FormData from 'form-data';
import { forgotPasswordEmail } from './forgotPassword';
import { resetPasswordUser } from './resetPassword';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const addReview = document.querySelector('.form--review');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const forgotPassword = document.querySelector('.form--forgot-password');
const resetPassword = document.querySelector('.form--reset-password');
// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (addReview) {
  addReview.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    console.log(rating, review);
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('tourId');
    addNewReview(review, rating, tourId);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (forgotPassword) {
  forgotPassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    console.log(email);
    forgotPasswordEmail(email);
  });
}

if (resetPassword) {
  resetPassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const passsword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const resetToken = window.location.pathname.split('/')[2];
    console.log(
      window.location.pathname.split('/')[2],
      passsword,
      passwordConfirm
    );
    resetPasswordUser(passsword, passwordConfirm, resetToken);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('.btn--save-password').innerHTML = 'Updating';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
  });

  document.getElementById('.btn--save-password').innerHTML = 'SAVE PASSWORD';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
