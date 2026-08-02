import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  ticketType: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  commissionAmount: number;
  organizerPayoutAmount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paystackReference: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    items: [
      {
        ticketTypeId: {
          type: Schema.Types.ObjectId,
          ref: "TicketType",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    organizerPayoutAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paystackReference: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
OrderSchema.index({ paystackReference: 1 }, { unique: true });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ eventId: 1 });

// Export pattern — use existing model or create new one
const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema, "orders");

export default Order;