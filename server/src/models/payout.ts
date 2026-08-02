import mongoose, { Schema, Document } from "mongoose";

export interface IPayout extends Document {
  _id: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "processing" | "paid" | "failed";
  scheduledDate: Date;
  paidDate?: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    scheduledDate: { type: Date, required: true },
    paidDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
PayoutSchema.index({ organizerId: 1 });
PayoutSchema.index({ eventId: 1 });
PayoutSchema.index({ status: 1 });

// Export pattern — use existing model or create new one
const Payout =
  mongoose.models.Payout ||
  mongoose.model<IPayout>("Payout", PayoutSchema, "payouts");

export default Payout;