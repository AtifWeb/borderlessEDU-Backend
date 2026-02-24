import { ConsultantPayment } from "../../schemas/consultant/payment.js";
import { Consultant } from "../../schemas/consultant/consultant.js";
import { StripeService } from "../../services/StripeService.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

export class ConsultantPaymentController {
  // start 7-day trial
  async startTrial(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const consultantId = req.user.id;
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const payload = {
        consultant: consultantId,
        paid: false,
        trial_ends_at: trialEnds,
        auto_renew: false,
      };

      const existing = await MongoService.findOne(ConsultantPayment, {
        consultant: consultantId,
      });
      if (existing) {
        // update trial
        existing.trial_ends_at = trialEnds;
        existing.paid = false;
        existing.auto_renew = false;
        await existing.save();
        return Response.success(res, "Trial started", {
          trial_ends_at: trialEnds,
        });
      }

      const created = await MongoService.create(ConsultantPayment, payload);
      Response.success(res, "Trial started", {
        trial_ends_at: created.trial_ends_at,
      });
    } catch (err) {
      console.error("Start Trial Error:", err);
      Response.error(res, "Failed to start trial", 500);
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const consultantId = req.user.id;
      const consultant = await MongoService.findById(Consultant, consultantId);
      if (!consultant) return Response.error(res, "Consultant not found", 404);

      // ensure payment doc
      let payment = await MongoService.findOne(ConsultantPayment, {
        consultant: consultantId,
      });
      if (!payment) {
        payment = await MongoService.create(ConsultantPayment, {
          consultant: consultantId,
        });
      }

      // create or reuse stripe customer
      let customerId = payment.stripe_customer_id;
      if (!customerId) {
        const customer = await StripeService.createCustomer(
          consultant.email,
          consultant.name
        );
        customerId = customer.id;
        payment.stripe_customer_id = customerId;
        await payment.save();
      }

      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId)
        return Response.error(res, "Stripe price not configured", 500);

      const successUrl =
        process.env.STRIPE_SUCCESS_URL || "https://example.com/success";
      const cancelUrl =
        process.env.STRIPE_CANCEL_URL || "https://example.com/cancel";

      const session = await StripeService.createCheckoutSession({
        customerId,
        priceId,
        successUrl,
        cancelUrl,
      });
      Response.success(res, "Checkout session created", {
        sessionId: session.id,
        url: session.url,
      });
    } catch (err) {
      console.error("Create Checkout Session Error:", err);
      Response.error(res, "Failed to create checkout session", 500);
    }
  }

  // Create setup intent for adding payment method
  async createSetupIntent(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const consultantId = req.user.id;

      // ensure payment doc
      let payment = await MongoService.findOne(ConsultantPayment, {
        consultant: consultantId,
      });
      if (!payment) {
        payment = await MongoService.create(ConsultantPayment, {
          consultant: consultantId,
        });
      }

      // create or reuse stripe customer
      let customerId = payment.stripe_customer_id;
      if (!customerId) {
        const consultant = await MongoService.findById(
          Consultant,
          consultantId
        );
        if (!consultant)
          return Response.error(res, "Consultant not found", 404);

        const customer = await StripeService.createCustomer(
          consultant.email,
          consultant.name
        );
        customerId = customer.id;
        payment.stripe_customer_id = customerId;
        await payment.save();
      }

      const setupIntent = await StripeService.createSetupIntent(customerId);
      Response.success(res, "Setup intent created", {
        clientSecret: setupIntent.client_secret,
      });
    } catch (err) {
      console.error("Create Setup Intent Error:", err);
      Response.error(res, "Failed to create setup intent", 500);
    }
  }

  // webhook endpoint for stripe events
  async webhook(req, res) {
    try {
      const sig = req.headers["stripe-signature"];
      const rawBody = req.rawBody || req.body;
      let event;
      try {
        event = StripeService.constructEvent(rawBody, sig);
      } catch (err) {
        console.error("Stripe webhook signature error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // handle events
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          // set payment as paid if subscription
          if (session.mode === "subscription") {
            const customerId = session.customer;
            const consultantPayment = await MongoService.findOne(
              ConsultantPayment,
              { stripe_customer_id: customerId }
            );
            if (consultantPayment) {
              consultantPayment.paid = true;
              consultantPayment.stripe_subscription_id =
                session.subscription ||
                consultantPayment.stripe_subscription_id;
              await consultantPayment.save();
            }
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          const subscription = await StripeService.retrieveSubscription(
            subscriptionId
          );
          const customerId = subscription.customer;
          const nextPeriodEnd = new Date(
            subscription.current_period_end * 1000
          );
          const consultantPayment = await MongoService.findOne(
            ConsultantPayment,
            { stripe_customer_id: customerId }
          );
          if (consultantPayment) {
            consultantPayment.paid = true;
            consultantPayment.last_payment_at = new Date();
            consultantPayment.next_payment_date = nextPeriodEnd;
            consultantPayment.stripe_subscription_id = subscriptionId;
            consultantPayment.auto_renew = subscription.cancel_at_period_end
              ? false
              : true;
            await consultantPayment.save();
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const consultantPayment = await MongoService.findOne(
            ConsultantPayment,
            { stripe_customer_id: customerId }
          );
          if (consultantPayment) {
            consultantPayment.paid = false;
            consultantPayment.stripe_subscription_id = null;
            consultantPayment.auto_renew = false;
            await consultantPayment.save();
          }
          break;
        }
        default:
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Stripe Webhook Processing Error:", err);
      res.status(500).send("Webhook processing failed");
    }
  }

  // get payment status for authenticated consultant
  async status(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const consultantId = req.user.id;
      const payment = await MongoService.findOne(ConsultantPayment, {
        consultant: consultantId,
      });
      if (!payment)
        return Response.success(res, "No payment record", {
          paid: false,
          in_trial: false,
        });

      const now = new Date();
      const inTrial = payment.trial_ends_at && payment.trial_ends_at > now;
      Response.success(res, "Payment status", {
        paid: payment.paid,
        in_trial: inTrial,
        trial_ends_at: payment.trial_ends_at,
        next_payment_date: payment.next_payment_date,
        auto_renew: payment.auto_renew,
      });
    } catch (err) {
      console.error("Payment Status Error:", err);
      Response.error(res, "Failed to get status", 500);
    }
  }
}

export default ConsultantPaymentController;
