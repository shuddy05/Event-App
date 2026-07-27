import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/keys.js";
import User, { IUser } from "../models/user.js";
import { EmailService } from "./email.service.js";

const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS = 10;

export class AuthService {
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateOtp(): string {
    // 6-digit numeric code, e.g. "042817"
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    return !!user;
  }

  async createUser(input: {
    fullname: string;
    email: string;
    password: string;
    phone: string;
    role: "attendee" | "organizer";
    companyName?: string;
  }): Promise<IUser> {
    const hashedPassword = await this.hashPassword(input.password);
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const user = await User.create({
      fullname: input.fullname,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      otpCode: otp,
      otpExpiresAt,
      ...(input.role === "organizer" && {
        organizerProfile: { companyName: input.companyName },
      }),
    });

    await EmailService.sendVerifyAccountEmail({
      user,
      otp,
      link: `${env.CLIENT_URL}/auth/verify-email?email=${encodeURIComponent(input.email)}`,
    });

    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<IUser | null> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+otpCode +otpExpiresAt",
    );

    if (!user || !user.otpCode || !user.otpExpiresAt) return null;
    if (user.otpCode !== otp) return null;
    if (user.otpExpiresAt.getTime() < Date.now()) return null;

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return user;
  }

  async resendOtp(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.isVerified) return false;

    const otp = this.generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await EmailService.sendVerifyAccountEmail({
      user,
      otp,
      link: `${env.CLIENT_URL}/auth/verify-email?email=${encodeURIComponent(email)}`,
    });

    return true;
  }


   async validateCredentials(
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) return null;

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async forgetPassword (email:string) : Promise<void>{
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return;
 
    const otp = this.generateOtp();
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );
    await user.save();
 
    await EmailService.sendPasswordResetEmail({ user, otp });


  }

  async resetPassword (email: string, otp: string, newPassword: string ) : Promise<boolean  > {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetOTP +passwordResetOTPExpiry",
    );
 
    if (!user || !user.passwordResetOTP || !user.passwordResetOTPExpiry)
      return false;
    if (user.passwordResetOTP !== otp) return false;
    if (user.passwordResetOTPExpiry.getTime() < Date.now()) return false;
 
    user.password = await this.hashPassword(newPassword);
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    await user.save();
 
    return true;
  }

  

 
}

export const authService = new AuthService();