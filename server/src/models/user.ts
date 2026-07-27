import mongoose, { Schema, Document } from "mongoose";


export interface IOrganizerProfile extends Document{
  companyName?: string;
  bankName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  isPayoutReady: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  paystackRecipientCode?: string;
}

const OrganizerProfileSchema = new Schema<IOrganizerProfile>(
  {
    companyName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    bankCode: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankAccountName: { type: String, trim: true },
    isPayoutReady: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paystackRecipientCode: { type: String, trim: true },
  },
  { _id: false }, // prevents Mongoose adding a stray auto _id to this subdocument
);


export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  role: "attendee" | "organizer" | "admin";
  isVerified: boolean;
  isSuspended: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  passwordResetOTP?: string;
  passwordResetOTPExpiry?: Date;
  avatar?: string;
  savedEvents: mongoose.Types.ObjectId[];
   organizerProfile?: IOrganizerProfile;
  
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
    isSuspended: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    passwordResetOTP: { type: String, select: false },
    passwordResetOTPExpiry: { type: Date, select: false },
    avatar: { type: String },
    savedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    organizerProfile: {
      type: OrganizerProfileSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
UserSchema.index({ role: 1 });

// Export pattern — use existing model or create new one
const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "users");

export default User;