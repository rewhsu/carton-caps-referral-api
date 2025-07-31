import { faker } from "@faker-js/faker";
import type { User, Referral } from "../types/referral";

const createMockDataService = () => {
  const users = new Map<string, User>();
  const referrals = new Map<string, Referral>();
  const referralsByUser = new Map<string, string[]>();
  const referralsByCode = new Map<string, string[]>();

  const generateReferralCode = (): string => {
    return faker.string.alphanumeric(8).toUpperCase();
  };

  const generateMockUsers = (): void => {
    const testUsers: User[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "test1@example.com",
        name: "Test User One",
        referralCode: "TEST0001",
        createdAt: "2024-01-15T10:00:00.000Z",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        email: "test2@example.com",
        name: "Test User Two",
        referralCode: "TEST0002",
        createdAt: "2024-02-01T10:00:00.000Z",
      },
    ];

    testUsers.forEach((user) => {
      users.set(user.id, user);
      referralsByUser.set(user.id, []);
    });

    for (let i = 0; i < 6; i++) {
      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        referralCode: generateReferralCode(),
        createdAt: faker.date.past({ years: 1 }).toISOString(),
      };
      users.set(user.id, user);
      referralsByUser.set(user.id, []);
    }
  };

  const generateMockReferrals = (): void => {
    const userIds = Array.from(users.keys());
    const statuses = ["pending", "completed", "expired"] as const;
    const shareMethods = ["email", "sms", "social", "link"] as const;

    for (let i = 0; i < 20; i++) {
      const referrerUserId = faker.helpers.arrayElement(userIds);
      const referrer = users.get(referrerUserId)!;
      const status = faker.helpers.arrayElement(statuses);
      const createdAt = faker.date.past({ years: 0.3 });

      const referral: Referral = {
        id: faker.string.uuid(),
        referrerUserId,
        referralCode: referrer.referralCode,
        referredUserEmail: faker.internet.email(),
        referredUserId: status === "completed" ? faker.string.uuid() : undefined,
        status,
        createdAt,
        completedAt:
          status === "completed"
            ? faker.date.between({ from: createdAt, to: new Date() })
            : undefined,
        sharedMethod: faker.helpers.arrayElement(shareMethods),
        customMessage: faker.datatype.boolean()
          ? faker.lorem.sentence()
          : undefined,
        expiresAt: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      };

      referrals.set(referral.id, referral);
      referralsByUser.get(referrerUserId)!.push(referral.id);

      if (!referralsByCode.has(referrer.referralCode)) {
        referralsByCode.set(referrer.referralCode, []);
      }
      referralsByCode.get(referrer.referralCode)!.push(referral.id);
    }
  };

  generateMockUsers();
  generateMockReferrals();

  return {
    getUserById: (userId: string): User | undefined => {
      return users.get(userId);
    },

    getUserReferrals: (userId: string, limit = 10, offset = 0) => {
      const referralIds = referralsByUser.get(userId) || [];
      const userReferrals = referralIds
        .map((id) => referrals.get(id))
        .filter((referral): referral is Referral => referral !== undefined)
        .map((referral) => ({
          ...referral,
          status:
            new Date() > referral.expiresAt && referral.status === "pending"
              ? ("expired" as const)
              : referral.status,
        }));

      const total = userReferrals.length;
      const paginatedReferrals = userReferrals.slice(offset, offset + limit);

      return { referrals: paginatedReferrals, total };
    },

    getReferralByCode: (referralCode: string): Referral | undefined => {
      const referralIds = referralsByCode.get(referralCode) || [];
      if (referralIds.length === 0) return undefined;

      const referral = referrals.get(referralIds[0]);
      if (!referral) return undefined;

      return {
        ...referral,
        status:
          new Date() > referral.expiresAt && referral.status === "pending"
            ? "expired"
            : referral.status,
      };
    },

    createReferral: (
      referrerUserId: string,
      referredUserEmail: string,
      sharedMethod: "email" | "sms" | "social" | "link",
      customMessage?: string
    ): Referral => {
      const referrer = users.get(referrerUserId);
      if (!referrer) {
        throw new Error("Referrer not found");
      }

      const { referrals: userReferrals } = mockDataService.getUserReferrals(
        referrerUserId,
        100
      );
      const pendingCount = userReferrals.filter(
        (r) => r.status === "pending"
      ).length;
      if (pendingCount >= 20) {
        throw new Error("Too many pending referrals");
      }

      const referral: Referral = {
        id: faker.string.uuid(),
        referrerUserId,
        referralCode: referrer.referralCode,
        referredUserEmail,
        status: "pending",
        createdAt: new Date(),
        sharedMethod,
        customMessage,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      referrals.set(referral.id, referral);
      referralsByUser.get(referrerUserId)!.push(referral.id);

      if (!referralsByCode.has(referrer.referralCode)) {
        referralsByCode.set(referrer.referralCode, []);
      }
      referralsByCode.get(referrer.referralCode)!.push(referral.id);

      return referral;
    },

    getReferralStats: (userId: string) => {
      const { referrals } = mockDataService.getUserReferrals(userId, 100);
      return {
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter((r) => r.status === "completed")
          .length,
        pendingReferrals: referrals.filter((r) => r.status === "pending")
          .length,
      };
    },

    getAbuseConfig: () => {
      return {
        maxPendingReferrals: 20,
        maxReferralsPerDay: 5,
        referralExpirationDays: 30,
      };
    },

    getFirstUser: (): User => Array.from(users.values())[0],

    getAllUsers: (limit = 50, offset = 0) => {
      const allUsers = Array.from(users.values());
      const total = allUsers.length;
      const paginatedUsers = allUsers.slice(offset, offset + limit);

      return { users: paginatedUsers, total };
    },
  };
};

export const mockDataService = createMockDataService();
