import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";

const placementClasses = {
  nav: "rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-stone-950 shadow-sm transition-colors hover:bg-amber-300",
  floating: "fixed bottom-24 right-4 z-40 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-stone-950 shadow-lg transition-transform hover:scale-105 hover:bg-amber-300 sm:right-6",
  inline: "inline-flex rounded-full bg-amber-400 px-5 py-3 font-bold text-stone-950 shadow-sm transition-colors hover:bg-amber-300",
  footer: "inline-flex rounded-full border border-amber-300 bg-amber-300 px-5 py-3 font-bold text-stone-950 transition-colors hover:bg-amber-200",
};

const EarnBigButton = ({ variant = "inline", className = "" }) => {
  const isFloating = variant === "floating";
  return (
    <Link
      to="/refer-and-earn"
      className={`${placementClasses[variant] || placementClasses.inline} ${className}`}
      data-analytics={`earn_big_click_${variant}`}
      aria-label={isFloating ? "Earn Big and become a consultant" : undefined}
    >
      {variant === "inline" || variant === "footer" ? "Earn Big" : "Earn Big"}
      {variant !== "floating" && <ArrowRight className="h-4 w-4" />}
      {variant === "floating" && <TrendingUp className="h-4 w-4" />}
    </Link>
  );
};

export default EarnBigButton;
