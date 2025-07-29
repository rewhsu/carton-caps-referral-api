"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDataService = void 0;
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const createMockDataService = () => {
    const users = new Map();
    const referrals = new Map();
    const referralsByUser = new Map();
    const referralsByCode = new Map();
    const generateReferralCode = () => {
        return faker_1.faker.string.alphanumeric(8).toUpperCase();
    };
    const generateMockUsers = () => {
        for (let i = 0; i < 8; i++) {
            const user = {
                id: (0, uuid_1.v4)(),
                email: faker_1.faker.internet.email(),
                name: faker_1.faker.person.fullName(),
                referralCode: generateReferralCode(),
                createdAt: faker_1.faker.date.past({ years: 1 }).toISOString(),
            };
            users.set(user.id, user);
            referralsByUser.set(user.id, []);
        }
    };
    const generateMockReferrals = () => {
        const userIds = Array.from(users.keys());
        const statuses = ["pending", "completed", "expired"];
        const shareMethods = ["email", "sms", "social", "link"];
        for (let i = 0; i < 20; i++) {
            const referrerUserId = faker_1.faker.helpers.arrayElement(userIds);
            const referrer = users.get(referrerUserId);
            const status = faker_1.faker.helpers.arrayElement(statuses);
            const createdAt = faker_1.faker.date.past({ years: 0.3 });
            const referral = {
                id: (0, uuid_1.v4)(),
                referrerUserId,
                referralCode: referrer.referralCode,
                referredUserEmail: faker_1.faker.internet.email(),
                referredUserId: status === "completed" ? (0, uuid_1.v4)() : undefined,
                status,
                createdAt,
                completedAt: status === "completed"
                    ? faker_1.faker.date.between({ from: createdAt, to: new Date() })
                    : undefined,
                shareMethod: faker_1.faker.helpers.arrayElement(shareMethods),
                customMessage: faker_1.faker.datatype.boolean()
                    ? faker_1.faker.lorem.sentence()
                    : undefined,
                expiresAt: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };
            referrals.set(referral.id, referral);
            referralsByUser.get(referrerUserId).push(referral.id);
            if (!referralsByCode.has(referrer.referralCode)) {
                referralsByCode.set(referrer.referralCode, []);
            }
            referralsByCode.get(referrer.referralCode).push(referral.id);
        }
    };
    generateMockUsers();
    generateMockReferrals();
    return {
        getUserById: (userId) => {
            return users.get(userId);
        },
        getUserReferrals: (userId, limit = 10, offset = 0) => {
            const referralIds = referralsByUser.get(userId) || [];
            const userReferrals = referralIds
                .map((id) => referrals.get(id))
                .filter((referral) => referral !== undefined)
                .map((referral) => ({
                ...referral,
                status: new Date() > referral.expiresAt && referral.status === "pending"
                    ? "expired"
                    : referral.status,
            }));
            const total = userReferrals.length;
            const paginatedReferrals = userReferrals.slice(offset, offset + limit);
            return { referrals: paginatedReferrals, total };
        },
        getReferralByCode: (referralCode) => {
            const referralIds = referralsByCode.get(referralCode) || [];
            if (referralIds.length === 0)
                return undefined;
            const referral = referrals.get(referralIds[0]);
            if (!referral)
                return undefined;
            return {
                ...referral,
                status: new Date() > referral.expiresAt && referral.status === "pending"
                    ? "expired"
                    : referral.status,
            };
        },
        createReferral: (referrerUserId, referredUserEmail, shareMethod, customMessage) => {
            const referrer = users.get(referrerUserId);
            if (!referrer) {
                throw new Error("Referrer not found");
            }
            const { referrals: userReferrals } = exports.mockDataService.getUserReferrals(referrerUserId, 100);
            const pendingCount = userReferrals.filter((r) => r.status === "pending").length;
            if (pendingCount >= 20) {
                throw new Error("Too many pending referrals");
            }
            const referral = {
                id: (0, uuid_1.v4)(),
                referrerUserId,
                referralCode: referrer.referralCode,
                referredUserEmail,
                status: "pending",
                createdAt: new Date(),
                shareMethod,
                customMessage,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            };
            referrals.set(referral.id, referral);
            referralsByUser.get(referrerUserId).push(referral.id);
            if (!referralsByCode.has(referrer.referralCode)) {
                referralsByCode.set(referrer.referralCode, []);
            }
            referralsByCode.get(referrer.referralCode).push(referral.id);
            return referral;
        },
        getReferralStats: (userId) => {
            const { referrals } = exports.mockDataService.getUserReferrals(userId, 100);
            return {
                totalReferrals: referrals.length,
                completedReferrals: referrals.filter((r) => r.status === "completed")
                    .length,
                pendingReferrals: referrals.filter((r) => r.status === "pending")
                    .length,
            };
        },
        getFirstUser: () => Array.from(users.values())[0],
    };
};
exports.mockDataService = createMockDataService();
//# sourceMappingURL=mockDataService.js.map