import mongoose, { Schema, Document } from "mongoose";

export interface IRefundRequest extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  ticket?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  amount: number;
}

const RefundRequestSchema = new Schema<IRefundRequest>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    // Optional: only set if refunding a single ticket out of a multi-ticket
    // order becomes a requirement later. Not used in this MVP.
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
    },
    amount: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
RefundRequestSchema.index({ userId: 1 });
RefundRequestSchema.index({ orderId: 1 });
RefundRequestSchema.index({ status: 1 });

// Export pattern — use existing model or create new one
const RefundRequest =
  mongoose.models.RefundRequest ||
  mongoose.model<IRefundRequest>(
    "RefundRequest",
    RefundRequestSchema,
    "refundRequests",
  );

export default RefundRequest;