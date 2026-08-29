import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import ProspectReferralCTA from "./ProspectReferralCTA.jsx";
const groups = [
  {
    label: "Listings",
    items: [
      ["Exclusive Sales", "/buy"],
      ["Luxury Rentals", "/rent"],
      ["Sell / Private Listing", "/sell"],
      ["Featured Collections", "/properties"],
    ],
  },
  {
    label: "About Us",
    items: [
      ["Who We Are", "/about"],
      ["Track Record", "/reviews"],
      ["Advisory & Management", "/services"],
      ["NYSC Careers", "/careers/nysc-legal-admin"],
      ["Get in Touch", "/contact"],
    ],
  },
  {
    label: "Market Insights",
    items: [
      ["Market Journal", "/blog"],
      ["Investor Briefings", "/investment-brief"],
      ["Case Studies", "/client-success"],
      ["Off-Plan & New Developments", "/ongoing-projects"],
    ],
  },
  {
    label: "Network",
    items: [
      ["EPAN Network", "/epan"],
      ["Our Realtors", "/agents"],
      ["Become an Agent", "/become-an-agent"],
    ],
  },
];
export default function Header() {
  const [open, setOpen] = useState(null),
    [mobile, setMobile] = useState(false);
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center"
          aria-label="Luxury Properties home"
        >
          <picture>
            <source
              srcSet="https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/render/image/public/site-assets/logo-optimized.webp?width=120&quality=80&format=webp"
              type="image/webp"
            />
            <img
              src="https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/render/image/public/site-assets/logo-optimized.webp?width=120&quality=80&format=webp"
              alt="Luxury Properties Ltd"
              className="h-12 w-auto object-contain"
              width="120"
              height="64"
            />
          </picture>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            to="/"
            className="rounded-full px-3 py-2 text-sm text-stone-700 hover:bg-amber-50"
          >
            Home
          </Link>
          {groups.map((g) => (
            <div
              key={g.label}
              className="relative"
              onMouseLeave={() => setOpen(null)}
            >
              <button
                onMouseEnter={() => setOpen(g.label)}
                onClick={() => setOpen(open === g.label ? null : g.label)}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-stone-700 hover:bg-amber-50"
              >
                {g.label}
                <ChevronDown
                  className={`h-4 w-4 ${open === g.label ? "rotate-180" : ""}`}
                />
              </button>
              {open === g.label && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border bg-white p-2 shadow-xl">
                  {g.items.map(([name, to]) => (
                    <Link
                      key={to}
                      to={to}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-amber-50"
                    >
                      {name}
                      <span className="mt-1 block text-xs font-normal text-stone-500">
                        Explore our {name.toLowerCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/contact"
            className="flex items-center gap-2 text-sm text-stone-700"
          >
            <Phone className="h-4 w-4" />
            Private Concierge
          </Link>
          <ProspectReferralCTA />
          <Link
            to="/sell"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-300"
          >
            List Property
          </Link>
        </div>
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobile(!mobile)}
          aria-label={mobile ? "Close menu" : "Open menu"}
          aria-expanded={mobile}
          aria-controls="mobile-navigation"
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
      {mobile && (
        <nav id="mobile-navigation" className="space-y-3 border-t bg-white p-5 lg:hidden">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="text-xs font-bold uppercase text-amber-700">
                {g.label}
              </p>
              {g.items.map(([name, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobile(false)}
                  className={`block py-2 text-sm ${location.pathname === to ? "text-amber-700" : "text-stone-700"}`}
                >
                  {name}
                </Link>
              ))}
            </div>
          ))}
          <ProspectReferralCTA className="w-full" />
          <Link
            to="/sell"
            className="block rounded-full bg-stone-900 p-3 text-center text-sm font-semibold text-amber-300"
          >
            List Property
          </Link>
        </nav>
      )}
    </header>
  );
}
