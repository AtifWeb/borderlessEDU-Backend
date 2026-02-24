import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const StripeService = {
  createCustomer: async (email, name) => {
    const customer = await stripe.customers.create({ email, name });
    return customer;
  },

  createCheckoutSession: async ({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
  }) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  },

  createSetupIntent: async (customerId) => {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });
    return setupIntent;
  },

  constructEvent: (rawBody, sig) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    return stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  },

  retrieveSubscription: async (subscriptionId) => {
    return stripe.subscriptions.retrieve(subscriptionId);
  },
};
