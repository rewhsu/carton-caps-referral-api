// Import all function files to register them with the Functions Framework
import "../functions/getUserReferrals";
import "../functions/getUserReferralInfo";
import "../functions/validateReferralCode";
import "../functions/createReferral";

import { getFunction } from "@google-cloud/functions-framework/testing";
import { mockDataService } from "../services/mockDataService";
import { jest } from "@jest/globals";
import type { HttpFunction } from "@google-cloud/functions-framework";

describe("Cloud Functions", () => {
  let testUser: any;

  beforeAll(() => {
    testUser = mockDataService.getFirstUser();
  });

  describe("getUserReferrals", () => {
    it("should return referrals for valid user", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;

      const req = {
        method: "GET",
        query: {
          userId: testUser.id,
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
          hasMore: expect.any(Boolean),
        })
      );
    });

    it("should return 400 for missing userId", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;

      const req = {
        method: "GET",
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
        error: "Missing required parameter: userId",
      });
    });

    it("should return 404 for non-existent user", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;

      const req = {
        method: "GET",
        query: {
          userId: "non-existent-user",
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
        error: "User not found",
      });
    });
  });

  describe("getUserReferralInfo", () => {
    it("should return referral info for valid user", async () => {
      const getUserReferralInfo = getFunction(
        "getUserReferralInfo"
      ) as HttpFunction;

      const req = {
        method: "GET",
        query: { userId: testUser.id },
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
      const getUserReferralInfo = getFunction(
        "getUserReferralInfo"
      ) as HttpFunction;

      const req = {
        method: "GET",
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
      const validateReferralCode = getFunction(
        "validateReferralCode"
      ) as HttpFunction;

      const req = {
        method: "GET",
        query: { referralCode: testUser.referralCode },
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
      const validateReferralCode = getFunction(
        "validateReferralCode"
      ) as HttpFunction;

      const req = {
        method: "GET",
        query: { referralCode: "INVALID123" },
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
        isValid: false,
        isExpired: false,
        reason: "not_found",
      });
    });
  });

  describe("createReferral", () => {
    it("should create referral for valid user", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;

      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "newuser@example.com",
          shareMethod: "email",
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
      const createReferral = getFunction("createReferral") as HttpFunction;

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
