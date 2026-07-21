import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  package: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  startDate: Date;
  endDate: Date;
  paystackReference: string;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paystackReference: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
PromotionSchema.index({ eventId: 1 });
PromotionSchema.index({ organizerId: 1 });
PromotionSchema.index({ status: 1 });

// Export pattern — use existing model or create new one
const Promotion =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema, "promotions");

export default Promotion;