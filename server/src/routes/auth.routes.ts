import { Router } from "express";
import {
  login,
  logout,
  register,
  resendOtp,
  verifyOtp,
  forgetPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { customRateLimiter, strictLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateFormData } from "../middlewares/formValidate.js";
import { verifySession } from "../middlewares/auth.middleware.js";
import {
  loginSchema,
  registerSchema,
  resendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../lib/schemaValidation.js";

const router = Router();

router.post(
  "/register",
  customRateLimiter(5, 15),
  validateFormData(registerSchema),
  register,
);

router.post(
  "/verify-otp",
  customRateLimiter(5, 15),
  validateFormData(verifyOtpSchema),
  verifyOtp,
);

router.post(
  "/resend-otp",
  customRateLimiter(3, 15),
  validateFormData(resendOtpSchema),
  resendOtp,
);

router.post(
  "/login",
  strictLimiter,
  validateFormData(loginSchema),
  login,
);

router.post(
  "/forget-password",
  strictLimiter,
  validateFormData(forgotPasswordSchema),
  forgetPassword,
);

router.post(
  "/reset-password",
  strictLimiter,
  validateFormData(resetPasswordSchema),
  resetPassword,
);

router.post("/logout", verifySession, logout);

export default router;