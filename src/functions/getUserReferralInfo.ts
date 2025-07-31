import type { Request, Response } from "express";
import { mockDataService } from "../services/mockDataService";
import type { ReferralInfo, ApiError } from "../types/referral";

export const getUserReferralInfo = (req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");

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
    const userId = req.params.userId as string;
    if (!userId) {
      const error: ApiError = {
        error: "INVALID_USER_ID",
        message: "Invalid user ID required",
        code: 400,
      };
      res.status(400).json(error);
      return;
    }

    const user = mockDataService.getUserById(userId);
    if (!user) {
      const error: ApiError = {
        error: "USER_NOT_FOUND",
        message: "User not found",
        code: 404,
      };
      res.status(404).json(error);
      return;
    }

    const stats = mockDataService.getReferralStats(userId);

    const response: ReferralInfo = {
      referralCode: user.referralCode,
      totalReferrals: stats.totalReferrals,
      completedReferrals: stats.completedReferrals,
      pendingReferrals: stats.pendingReferrals,
      totalRewards: stats.completedReferrals * 5,
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
