import type { User, Referral } from "../types/referral";
export declare const mockDataService: {
    getUserById: (userId: string) => User | undefined;
    getUserReferrals: (userId: string, limit?: number, offset?: number) => {
        referrals: {
            status: "pending" | "completed" | "expired";
            id: string;
            referrerUserId: string;
            referralCode: string;
            referredUserEmail: string;
            referredUserId?: string;
            createdAt: Date;
            completedAt?: Date;
            shareMethod: "email" | "sms" | "social" | "link";
            customMessage?: string;
            expiresAt: Date;
        }[];
        total: number;
    };
    getReferralByCode: (referralCode: string) => Referral | undefined;
    createReferral: (referrerUserId: string, referredUserEmail: string, shareMethod: "email" | "sms" | "social" | "link", customMessage?: string) => Referral;
    getReferralStats: (userId: string) => {
        totalReferrals: number;
        completedReferrals: number;
        pendingReferrals: number;
    };
    getFirstUser: () => User;
};
//# sourceMappingURL=mockDataService.d.ts.map