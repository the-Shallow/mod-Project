/* eslint-disable */
import axios from 'axios';
import { showAlerts } from './alerts';

export const resetPasswordUser = async (password,passwordConfirm,token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlerts('success', 'Password Updated Sucessfully');
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
