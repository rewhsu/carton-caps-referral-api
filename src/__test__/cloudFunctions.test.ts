import { getFunction } from "@google-cloud/functions-framework/testing";
import { mockDataService } from "../services/mockDataService";
import { jest } from "@jest/globals";
import type { HttpFunction } from "@google-cloud/functions-framework";

describe("Cloud Functions", () => {
  let testUser: any;

  beforeAll(async () => {
    await import("../functions/getUserReferrals");
    testUser = mockDataService.getFirstUser();
  });

  describe("getUserReferrals", () => {
    it("should return paginated referrals for valid user", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;
      const req = {
        method: "GET",
        query: { userId: testUser.id, limit: "5", offset: "0" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referrals: expect.any(Array),
          total: expect.any(Number),
          limit: 5,
          offset: 0,
          hasMore: expect.any(Boolean),
        })
      );
    });

    it("should return 400 for missing userId", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;
      const req = { method: "GET", query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "MISSING_USER_ID",
        })
      );
    });

    it("should return 404 for non-existent user", async () => {
      const getUserReferrals = getFunction("getUserReferrals") as HttpFunction;
      const req = {
        method: "GET",
        query: { userId: "non-existent-user", limit: "10", offset: "0" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferrals(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "USER_NOT_FOUND",
        })
      );
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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferralInfo(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referralCode: expect.any(String),
          totalReferrals: expect.any(Number),
          completedReferrals: expect.any(Number),
          pendingReferrals: expect.any(Number),
          totalRewards: expect.any(Number),
          maxReferralsReached: expect.any(Boolean),
        })
      );
    });

    it("should return 400 for missing userId", async () => {
      const getUserReferralInfo = getFunction(
        "getUserReferralInfo"
      ) as HttpFunction;
      const req = { method: "GET", query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferralInfo(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "MISSING_USER_ID",
        })
      );
    });

    it("should return 404 for non-existent user", async () => {
      const getUserReferralInfo = getFunction(
        "getUserReferralInfo"
      ) as HttpFunction;
      const req = {
        method: "GET",
        query: { userId: "non-existent-user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await getUserReferralInfo(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await validateReferralCode(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: expect.any(Boolean),
          isExpired: expect.any(Boolean),
        })
      );
    });

    it("should return 400 for missing referral code", async () => {
      const validateReferralCode = getFunction(
        "validateReferralCode"
      ) as HttpFunction;
      const req = {
        method: "GET",
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await validateReferralCode(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "MISSING_REFERRAL_CODE",
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
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await validateReferralCode(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          isExpired: false,
          reason: "not_found",
        })
      );
    });
  });

  describe("createReferral", () => {
    it("should create new referral with valid data", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "newuser@example.com",
          shareMethod: "email",
          customMessage: "Join me!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referral: expect.objectContaining({
            id: expect.any(String),
            status: "pending",
            referrerUserId: testUser.id,
            referredUserEmail: "newuser@example.com",
          }),
          shareUrl: expect.stringContaining("carton-caps.app/install"),
        })
      );
    });

    it("should return 400 for missing required fields", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "newuser@example.com",
          shareMethod: "email",
          customMessage: "Join me!",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 for non-existent referrer", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;
      const req = {
        method: "POST",
        body: {
          referrerUserId: "non-existent-user",
          referredUserEmail: "test@example.com",
          shareMethod: "email",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "USER_NOT_FOUND",
        })
      );
    });

    it("should return 400 for invalid email format", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "invalid-email",
          shareMethod: "email",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "INVALID_EMAIL",
        })
      );
    });

    it("should return 400 for invalid share method", async () => {
      const createReferral = getFunction("createReferral") as HttpFunction;
      const req = {
        method: "POST",
        body: {
          referrerUserId: testUser.id,
          referredUserEmail: "test@example.com",
          shareMethod: "invalid-method",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
      };

      await createReferral(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "INVALID_SHARE_METHOD",
        })
      );
    });
  });
});
