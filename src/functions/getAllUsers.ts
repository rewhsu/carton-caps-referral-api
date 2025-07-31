import type { Request, Response } from "express";;
import { mockDataService } from "../services/mockDataService";
import type { User, ApiError } from "../types/referral";
import type { ReadonlyDeep } from "type-fest";

export const getAllUsers = (req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    const error: ApiError = {
      error: "METHOD_NOT_ALLOWED",
      message: "Only GET method is allowed",
      code: 405,
    };
    res.status(405).json(error);
    return;
  }

  try {
    const limit = Math.min(
      Number.parseInt(req.query.limit as string) || 50,
      100
    );
    const offset = Number.parseInt(req.query.offset as string) || 0;

    const { users, total } = mockDataService.getAllUsers(limit, offset);

    const response = {
      users: users as ReadonlyDeep<User[]>,
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
