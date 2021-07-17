/* eslint-disable */
import axios from 'axios';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51JDjG0SEELh9h1QNMHmdy4IWgInjw7GMpHmViPr44WQF9L67t7gLUFdtCxvv6xzdEDrwM4PcLDid8sl9ahko7Sab00dz2aAjg0'
    );

    // 1> get Checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);
    // 2> Create checkout form + charges
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
