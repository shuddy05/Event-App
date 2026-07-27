import { z } from "zod";

export const registerSchema = z
  .object({
    fullname: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.email("Enter a valid email address"),
    phone: z
      .string()
      .min(10, "Enter a valid phone number")
      .max(15, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
      .regex(/\d/, "Password must contain at least one number"),
    role: z.enum(["attendee", "organizer"]).default("attendee"),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => data.role !== "organizer" || !!data.companyName?.trim(),
    {
      message: "Company name is required when signing up as an organizer",
      path: ["companyName"],
    },
  );

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.email("Enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resendOtpSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})