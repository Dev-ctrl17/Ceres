import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProspectReferralCTA({ className = "" }) {
  return (
    <Link
      to="/refer-and-earn"
      className={`prospect-referral-cta inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 ${className}`}
      data-analytics="prospect_referral_cta_click"
    >
      Refer &amp; Earn
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}