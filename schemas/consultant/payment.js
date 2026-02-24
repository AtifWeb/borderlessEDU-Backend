import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant",
      required: true,
      unique: true,
    },
    paid: { type: Boolean, default: false },
    plan: { type: String, default: "standard" },
    stripe_customer_id: { type: String },
    stripe_subscription_id: { type: String },
    current_period_end: { type: Date },
    next_payment_date: { type: Date },
    last_payment_at: { type: Date },
    auto_renew: { type: Boolean, default: false },
    trial_ends_at: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ consultant: 1 });

export const ConsultantPayment = mongoose.model(
  "ConsultantPayment",
  paymentSchema
);
