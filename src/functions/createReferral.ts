import type { Request, Response } from "express";
import { mockDataService } from "../services/mockDataService";
import type {
  CreateReferralRequest,
  CreateReferralResponse,
  ApiError,
} from "../types/referral";

export const createReferral = (req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    const error: ApiError = {
      error: "INVALID_METHOD",
      message: "Invalid HTTP method",
      code: 405,
    };
    res.status(405).json(error);
    return;
  }

  try {
    const requestBody = req.body as CreateReferralRequest;
    const { referrerUserId, referredUserEmail, sharedMethod, customMessage } =
      requestBody;

    if (!referrerUserId || !referredUserEmail || !sharedMethod) {
      const error: ApiError = {
        error: "INVALID_REQUEST",
        message: "Missing required fields",
        code: 400,
      };

      res.status(400).json(error);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(referredUserEmail)) {
      const error: ApiError = {
        error: "INVALID_EMAIL",
        message: "Invalid email address",
        code: 400,
      };

      res.status(400).json(error);
      return;
    }

    const validShareMethods = ["email", "sms", "social", "link"];
    if (!validShareMethods.includes(sharedMethod)) {
      const error: ApiError = {
        error: "INVALID_SHARE_METHOD",
        message: "Invalid share method",
        code: 400,
      };

      res.status(400).json(error);
      return;
    }

    const user = mockDataService.getUserById(referrerUserId);
    if (!user) {
      const error: ApiError = {
        error: "USER_NOT_FOUND",
        message: "Referrer not found",
        code: 404,
      };

      res.status(404).json(error);
      return;
    }

    const referral = mockDataService.createReferral(
      referrerUserId,
      referredUserEmail,
      sharedMethod,
      customMessage
    );
    const shareUrl = `${process.env.SHARE_URL}/install?ref=${
      user.referralCode
    }&email=${encodeURIComponent(referredUserEmail)}`;

    const response: CreateReferralResponse = {
      referral,
      shareUrl,
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
