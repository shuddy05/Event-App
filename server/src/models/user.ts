import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  role: "attendee" | "organizer" | "admin";
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  avatar?: string;
  savedEvents: mongoose.Types.ObjectId[];
  organizerProfile?: {
    bankAccountNumber?: string;
    bankName?: string;
    bankAccountName?: string;
    status: "pending" | "approved" | "rejected";
  };
}

const UserSchema = new Schema<IUser>(
  {
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["attendee", "organizer", "admin"],
      default: "attendee",
    },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    avatar: { type: String },
    savedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    organizerProfile: {
      bankAccountNumber: { type: String },
      bankName: { type: String },
      bankAccountName: { type: String },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Export pattern — use existing model or create new one
const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "users");

export default User;