"use strict";
/**
 * Shared TypeScript types for the Multi-Tier Referral System.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFERRAL_BASE_URL = exports.MAX_TREE_DEPTH = exports.COMMISSION_BREAKDOWN = void 0;
/** Commission breakdown percentages per generation level. */
exports.COMMISSION_BREAKDOWN = {
    1: 0.5, // Depth 1 (Direct Agent/Closer): 50%
    2: 0.2, // Depth 2 (2nd Gen Upline):      20%
    3: 0.15, // Depth 3 (3rd Gen Upline):      15%
    4: 0.15, // Depth 4 (4th Gen Upline):      15%
};
/** Maximum referral tree depth supported by the system. */
exports.MAX_TREE_DEPTH = 4;
/** Base URL for generated referral links. */
exports.REFERRAL_BASE_URL = 'https://luxurypropertiesltd.com.ng/register';
//# sourceMappingURL=types.js.map