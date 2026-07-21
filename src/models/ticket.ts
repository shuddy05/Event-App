import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketTypeId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  qrCode: string;
  status: "valid" | "checked_in" | "cancelled" | "refunded";
  checkedInAt?: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "TicketType" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    qrCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["valid", "checked_in", "cancelled", "refunded"],
      default: "valid",
    },
    checkedInAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
TicketSchema.index({ qrCode: 1 }, { unique: true });
TicketSchema.index({ eventId: 1 });
TicketSchema.index({ userId: 1 });

// Export pattern — use existing model or create new one
const Ticket =
  mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema, "tickets");

export default Ticket;