import { Simplify, ReadonlyDeep } from "type-fest";

export type ShareMethod = "email" | "sms" | "social" | "link";

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
  sharedMethod: ShareMethod;
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
  sharedMethod: ShareMethod;
  customMessage?: string;
}>;

export type CreateReferralResponse = Simplify<{
  referral: Referral;
  shareUrl: string;
}>;

export type ValidateReferralResponse = Simplify<{
  isValid: boolean;
  isExpired?: boolean;
  reason?: "not_found" | "expired" | "already_used";
  referral?: Referral;
  referrer?: Pick<User, "id" | "name">;
}>;

export type PaginatedReferralsResponse = Simplify<{
  referrals: ReadonlyDeep<Referral[]>;
  total: number;
  limit: number;
  offset: number;
}>;

export type ApiError = Simplify<{
  error: string;
  message: string;
  code: number;
}>;
