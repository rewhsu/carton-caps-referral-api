import { getUserReferrals } from "../functions/getUserReferrals";
import { getUserReferralInfo } from "../functions/getUserReferralInfo";
import { validateReferralCode } from "../functions/validateReferralCode";
import { createReferral } from "../functions/createReferral";
import { mockDataService } from "../services/mockDataService";
import { jest } from "@jest/globals";
import type { Request, Response } from "express";

describe("Cloud Functions", () => {
  let testUser: any;

  beforeAll(() => {
    testUser = mockDataService.getFirstUser();
  });

  describe("getUserReferrals", () => {
    it("should return referrals for valid user", async () => {
      const req = {
        method: "GET",
        params: {
          userId: testUser.id,
        },
        query: {
          limit: "10",
          offset: "0",
        },
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referrals: expect.any(Array),
          total: expect.any(Number),
        })
      );
    });

    it("should return 400 for missing userId", async () => {
      const req = {
        method: "GET",
        params: {},
        query: {},
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "INVALID_USER_ID",
        message: "Invalid user ID required",
        code: 400,
      });
    });

    it("should return 404 for non-existent user", async () => {
      const req = {
        method: "GET",
        params: {
          userId: "non-existent-user",
        },
        query: {
          limit: "10",
          offset: "0",
        },
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "USER_NOT_FOUND",
        message: "User not found",
        code: 404,
      });
    });
  });

  describe("getUserReferralInfo", () => {
    it("should return referral info for valid user", async () => {
      const req = {
        method: "GET",
        params: {
          userId: testUser.id,
        },
        query: {},
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await getUserReferralInfo(req as any, res as any);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referralCode: expect.any(String),
          totalReferrals: expect.any(Number),
          pendingReferrals: expect.any(Number),
          completedReferrals: expect.any(Number),
        })
      );
    });

    it("should return 400 for missing userId", async () => {
      const req = {
        method: "GET",
        params: {},
        query: {},
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await getUserReferralInfo(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateReferralCode", () => {
    it("should validate existing referral code", async () => {
      const req = {
        method: "GET",
        params: {
          referralCode: testUser.referralCode,
        },
        query: {},
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await validateReferralCode(req as any, res as any);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: expect.any(Boolean),
        })
      );
    });

    it("should return invalid for non-existent referral code", async () => {
      const req = {
        method: "GET",
        params: { referralCode: "INVALID123" },
        query: {},
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await validateReferralCode(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith({
        error: "INVALID_REFERRAL_CODE",
        message: "Invalid referral code required",
        code: 400,
      });
    });
  });

  describe("createReferral", () => {
    it("should create referral for valid user", async () => {
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "newuser@example.com",
          sharedMethod: "email",
          customMessage: "Join me on Carton Caps!",
        },
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referral: expect.objectContaining({
            id: expect.any(String),
            referrerUserId: testUser.id,
            referredUserEmail: "newuser@example.com",
          }),
          shareUrl: expect.any(String),
        })
      );
    });

    it("should return 400 for missing required fields", async () => {
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
        },
        get: jest.fn(),
        header: jest.fn(),
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
