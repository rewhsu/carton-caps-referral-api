import type { Request, Response } from "express";
import { mockDataService } from "../services/mockDataService";
import type {
  ApiError,
  PaginatedReferralsResponse,
  Referral,
} from "../types/referral";
import type { ReadonlyDeep } from "type-fest";

export const getUserReferrals = (req: Request, res: Response): void => {
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
    const userId = (req.params.userId as string) ?? null;
    const limit = Number((req.query.limit as string) ?? 10);
    const offset = Number((req.query.offset as string) ?? 0);

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

    const { referrals, total } = mockDataService.getUserReferrals(
      userId,
      limit,
      offset
    );

    const response: PaginatedReferralsResponse = {
      referrals: referrals as ReadonlyDeep<Referral[]>,
      total,
      limit,
      offset,
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
