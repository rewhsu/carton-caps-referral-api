import { Simplify, ReadonlyDeep } from "type-fest";
export interface User {
    id: string;
    email: string;
    name: string;
    referralCode: string;
    createdAt: string;
}
export interface Referral {
    id: string;
    referrerUserId: string;
    referralCode: string;
    referredUserEmail: string;
    referredUserId?: string;
    status: "pending" | "completed" | "expired";
    createdAt: Date;
    completedAt?: Date;
    shareMethod: "email" | "sms" | "social" | "link";
    customMessage?: string;
    expiresAt: Date;
}
export type ReferralInfo = Simplify<{
    referralCode: string;
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
}>;
export type CreateReferralRequest = Simplify<{
    referrerUserId: string;
    referredUserEmail: string;
    sharedMethod: "email" | "sms" | "in-social" | "link";
    customMessage?: string;
}>;
export type CreateReferralResponse = Simplify<{
    referral: Referral;
    shareUrl: string;
}>;
export type ValidateReferralResponse = Simplify<{
    isValid: boolean;
    referral?: Referral;
    referrer?: Pick<User, "id" | "name">;
}>;
export type PaginatedReferralsResponse = Simplify<{
    referrals: ReadonlyDeep<Referral[]>;
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}>;
export type ApiError = Simplify<{
    error: string;
    message: string;
    code: number;
}>;
//# sourceMappingURL=referral.d.ts.map