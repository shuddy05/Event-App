import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { sendTsRestError } from "../lib/responseHandler.js";

export const validateFormData =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      sendTsRestError(
        res,
        400,
        "Validation failed",
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );
      return;
    }

    req.body = result.data;
    next();
  };