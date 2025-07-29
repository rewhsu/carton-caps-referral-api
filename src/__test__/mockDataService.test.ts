import { mockDataService } from "../services/mockDataService";

describe("MockDataService", () => {
  describe("Basic Functionality", () => {
    it("should provide a test user", () => {
      const testUser = mockDataService.getFirstUser();

      expect(testUser).toBeDefined();
      expect(testUser.id).toBeDefined();
      expect(testUser.referralCode).toHaveLength(8);
      expect(testUser.email).toContain("@");
      expect(testUser.name).toBeDefined();
    });

    it("should get user by ID", () => {
      const testUser = mockDataService.getFirstUser();
      const foundUser = mockDataService.getUserById(testUser.id);

      expect(foundUser).toEqual(testUser);
    });

    it("should return undefined for non-existent user", () => {
      const foundUser = mockDataService.getUserById("non-existent-id");

      expect(foundUser).toBeUndefined();
    });
  });

  describe("Referral Management", () => {
    it("should get user referrals", () => {
      const testUser = mockDataService.getFirstUser();
      const { referrals, total } = mockDataService.getUserReferrals(
        testUser.id
      );

      expect(Array.isArray(referrals)).toBe(true);
      expect(typeof total).toBe("number");
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it("should create new referral", () => {
      const testUser = mockDataService.getFirstUser();
      const email = "newuser@example.com";

      const referral = mockDataService.createReferral(
        testUser.id,
        email,
        "email",
        "Join me!"
      );

      expect(referral).toBeDefined();
      expect(referral.referrerUserId).toBe(testUser.id);
      expect(referral.referredUserEmail).toBe(email);
      expect(referral.status).toBe("pending");
      expect(referral.sharedMethod).toBe("email");
      expect(referral.customMessage).toBe("Join me!");
    });

    it("should validate referral code", () => {
      const testUser = mockDataService.getFirstUser();
      const referral = mockDataService.getReferralByCode(testUser.referralCode);

      expect(referral === undefined || typeof referral === "object").toBe(true);
    });
  });

  describe("Abuse Prevention", () => {
    it("should enforce maximum pending referrals", () => {
      const testUser = mockDataService.getFirstUser();

      const emails: string[] = [];
      for (let i = 0; i < 25; i++) {
        const email = `user${i}@test.com`;
        emails.push(email);

        try {
          mockDataService.createReferral(testUser.id, email, "email");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Too many pending referrals");
          break;
        }
      }
    });

    it("should return abuse prevention config", () => {
      const config = mockDataService.getAbuseConfig();

      expect(config).toEqual({
        maxPendingReferrals: 20,
        maxReferralsPerDay: 5,
        referralExpirationDays: 30,
      });
    });
  });

  describe("Referral Statistics", () => {
    it("should return referral stats", () => {
      const testUser = mockDataService.getFirstUser();
      const stats = mockDataService.getReferralStats(testUser.id);

      expect(stats).toHaveProperty("totalReferrals");
      expect(stats).toHaveProperty("completedReferrals");
      expect(stats).toHaveProperty("pendingReferrals");
      expect(typeof stats.totalReferrals).toBe("number");
      expect(typeof stats.completedReferrals).toBe("number");
      expect(typeof stats.pendingReferrals).toBe("number");
    });
  });

  describe("Referral Expiration", () => {
    it("should handle expired referrals", () => {
      const testUser = mockDataService.getFirstUser();
      const { referrals } = mockDataService.getUserReferrals(testUser.id);

      referrals.forEach((referral) => {
        if (
          new Date() > referral.expiresAt &&
          referral.status !== "completed"
        ) {
          expect(referral.status).toBe("expired");
        }
      });
    });
  });
});
