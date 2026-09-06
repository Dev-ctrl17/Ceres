/**
 * Shared TypeScript types for the Multi-Tier Referral System.
 */
/** A consultant/agent in the system. */
export interface User {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    referral_code: string;
    parent_id: string | null;
    created_at: string;
}
/** A row in the closure table (referral_trees). */
export interface ReferralTreeRow {
    ancestor_id: string;
    descendant_id: string;
    depth: number;
}
/** A completed property deal. */
export interface Deal {
    id: string;
    property_name: string;
    deal_amount: number;
    closing_user_id: string;
    status: 'pending' | 'verified' | 'paid';
    created_at: string;
}
/** A commission entry owed to a user for a deal. */
export interface Commission {
    id: string;
    deal_id: string;
    user_id: string;
    generation_level: number;
    amount: number;
    status: 'pending' | 'disbursed';
    created_at: string;
}
/** Commission breakdown percentages per generation level. */
export declare const COMMISSION_BREAKDOWN: Record<number, number>;
/** Maximum referral tree depth supported by the system. */
export declare const MAX_TREE_DEPTH = 4;
/** Base URL for generated referral links. */
export declare const REFERRAL_BASE_URL = "https://luxurypropertiesltd.com.ng/register";
