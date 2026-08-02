import { Request, Response } from "express";
import { sendTsRestError, sendTsRestSuccess } from "../lib/responseHandler.js";
import tryCatchWrapper from "../lib/tryCatchWrapper.js";
import { authService } from "../services/auth.service.js";

// POST /auth/register
export const register = tryCatchWrapper(async (req: Request, res: Response) => {
  const { fullname, email, password, phone, role, companyName } = req.body;

  const alreadyExists = await authService.emailExists(email);
  if (alreadyExists) {
    return sendTsRestError(res, 409, "An account with this email already exists");
  }

  const user = await authService.createUser({
    fullname,
    email: email.toLowerCase(),
    password,
    phone,
    role,
    companyName,
  });

  return sendTsRestSuccess(res, 201, {
    success: true,
    message: "Account created. Check your email for a verification code.",
    body: { email: user.email },
  });
});

// POST /auth/verify-otp
export const verifyOtp = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await authService.verifyOtp(email, otp);
  if (!user) {
    return sendTsRestError(res, 400, "Invalid or expired verification code");
  }

  // Log the user in immediately once verified
  req.session.userId = user._id.toString();
  req.session.role = user.role;

  return sendTsRestSuccess(res, 200, {
    success: true,
    message: "Account verified successfully",
    body: { id: user._id, fullname: user.fullname, role: user.role },
  });
});

// POST /auth/resend-otp
export const resendOtp = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email } = req.body;

  const sent = await authService.resendOtp(email);
  if (!sent) {
    return sendTsRestError(
      res,
      400,
      "Unable to resend code — account not found or already verified",
    );
  }

 return sendTsRestSuccess<undefined>(res, 200, {
  success: true,
  message: "A new verification code has been sent to your email",
});

});

// POST /auth/login
export const login = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authService.validateCredentials(email, password);
  if (!user) {
    return sendTsRestError(res, 401, "Invalid email or password");
  }

  if (!user.isVerified) {
    return sendTsRestError(res, 403, "Please verify your email before logging in");
  }
  if (!user.isSuspended) {
    return sendTsRestError(res, 403, "This account has been suspended. Contact support for help");
  }

  req.session.userId = user._id.toString();
  req.session.role = user.role;

  return sendTsRestSuccess(res, 200, {
    success: true,
    message: "Logged in successfully",
    body: { id: user._id, fullname: user.fullname, role: user.role },
  });
});

export const forgetPassword = tryCatchWrapper(async (req:Request, res:Response) =>{


    const { email } = req.body;
 
    // Always call this and always return the same generic message —
    // never reveal whether the email exists (prevents account enumeration).
    await authService.forgetPassword(email);
 
    return sendTsRestSuccess<undefined>(res, 200, {
      success: true,
      message:
        "If an account exists with this email, a reset code has been sent",
    });
  },
)
export const resetPassword = tryCatchWrapper(async (req:Request, res:Response) =>{
   const { email, otp, newPassword } = req.body;
 
    const didReset = await authService.resetPassword(email, otp, newPassword);
    if (!didReset) {
      return sendTsRestError(res, 400, "Invalid or expired reset code");
    }
 
    return sendTsRestSuccess<undefined>(res, 200, {
      success: true,
      message: "Password reset successfully. You can now log in.",
    });

})

// POST /auth/logout
export const logout = tryCatchWrapper(async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return sendTsRestError(res, 500, "Failed to log out, please try again");
    }
    res.clearCookie("_evtSessionId");
    return sendTsRestSuccess<undefined>(res, 200, {
      success: true,
      message: "Logged out successfully",
    });
  });
});