import type { Request, Response } from "@google-cloud/functions-framework";
import { mockDataService } from "../services/mockDataService";
import type { ValidateReferralResponse, ApiError } from "../types/referral";

export const validateReferralCode = (req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }

  if (req.method !== "GET") {
    const error: ApiError = {
      error: "INVALID_METHOD",
      message: "Invalid HTTP method",
      code: 405,
    };
    res.status(405).json(error);
    return;
  }

  try {
    const referralCode = req.params.referralCode as string;

    if (!referralCode || referralCode.length !== 8) {
      const error: ApiError = {
        error: "INVALID_REFERRAL_CODE",
        message: "Invalid referral code required",
        code: 400,
      };
      res.status(400).json(error);
      return;
    }

    const referral = mockDataService.getReferralByCode(referralCode);

    if (!referral) {
      const response: ValidateReferralResponse = {
        isValid: false,
        isExpired: false,
        reason: "not_found",
      };
      res.json(response);
      return;
    }

    const referrer = mockDataService.getUserById(referral.referrerUserId);
    const isExpired =
      referral.status === "expired" || new Date() > referral.expiresAt;

    const response: ValidateReferralResponse = {
      isValid: !isExpired && referral.status !== "pending",
      isExpired,
      referral: !isExpired ? referral : undefined,
      referrer:
        !isExpired && referrer
          ? {
              id: referrer.id,
              name: referrer.name,
            }
          : undefined,
      reason: isExpired
        ? "expired"
        : referral.status === "completed"
        ? "already_used"
        : undefined,
    };

    res.json(response);
  } catch (error) {
    const apiError: ApiError = {
      error: "INTERNAL_ERROR",
      message: "Internal server error",
      code: 500,
    };
    res.status(500).json(apiError);
  }
};
