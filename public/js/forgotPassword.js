/* eslint-disable */
import axios from 'axios';
import { showAlerts } from './alerts';

export const forgotPasswordEmail = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
        data: {
          email:email
      }
    });

    if (res.data.status === 'success') {
      showAlerts('success', 'Mail sent Successfully');
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
