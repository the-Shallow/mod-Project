/* eslint-disable */
import axios from 'axios';
import { showAlerts } from './alerts';

export const addNewReview = async (review, rating,tourId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourId}/reviews`,
      data: {
        review,
        rating,
      },
    });

    
    if (res.data.status === 'Success') {
      showAlerts('success', 'Review Added succesfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    // console.log('Hello');
    console.log(err);
    showAlerts('error', err.response.data.message);
  }
};

