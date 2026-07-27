import { NextFunction, Request, Response } from "express";
import { sendTsRestError } from "../lib/responseHandler.js";

export const verifySession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.session?.userId) {
    sendTsRestError(res, 401, "You must be logged in to do this");
    return;
  }
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.session?.userId) {
    sendTsRestError(res, 401, "You must be logged in to do this");
    return;
  }
  if (req.session.role !== "admin") {
    sendTsRestError(res, 403, "Admin access required");
    return;
  }
  next();
};

export const requireRole =
  (...roles: Array<"attendee" | "organizer" | "admin">) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.userId) {
      sendTsRestError(res, 401, "You must be logged in to do this");
      return;
    }
    if (!req.session.role || !roles.includes(req.session.role)) {
      sendTsRestError(res, 403, "You do not have access to this resource");
      return;
    }
    next();
  };