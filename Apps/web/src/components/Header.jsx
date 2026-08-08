import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getImageProps } from "@/components/imgUtils.js";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Buy", path: "/buy" },
    { name: "Rent", path: "/rent" },
    { name: "Sell", path: "/sell" },
    { name: "Properties", path: "/properties" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "Investment Brief", path: "/investment-brief" },
    { name: "Client Success", path: "/client-success" },
    { name: "Ongoing Projects", path: "/ongoing-projects" },
    { name: "EPAN", path: "/epan" },
    { name: "Agents", path: "/agents" },
    { name: "Join as Consultant", path: "/register" },
    { name: "Reviews", path: "/reviews" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];
  const navGroups = [
    { name: "Properties", links: navLinks.filter((link) => ["/buy", "/rent", "/sell", "/properties", "/services"].includes(link.path)) },
    { name: "Company", links: navLinks.filter((link) => ["/about", "/contact", "/reviews", "/office-locations"].includes(link.path)) },
    { name: "Resources", links: navLinks.filter((link) => ["/blog", "/investment-brief", "/client-success", "/ongoing-projects"].includes(link.path)) },
    { name: "Partners", links: navLinks.filter((link) => ["/epan", "/agents", "/register", "/consultant-portal"].includes(link.path)) },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-gray-200 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-16 sm:h-16 md:h-18 lg:h-20 xl:h-22 2xl:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <picture>
              <source
                srcSet="https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/site-assets/logo-optimized.webp"
                type="image/webp"
              />
              <img
                src="https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/site-assets/logo-optimized.png"
                alt="Luxury Property"
                className="h-8 xs:h-9 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-20 w-auto object-contain"
                width="160"
                height="80"
                style={{ filter: "brightness(1) contrast(1)", maxWidth: "120px" }}
                loading="eager"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </picture>
          </Link>

          {/* Desktop Nav - visible from lg:992px */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            <Link to="/" className="px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg" style={{ color: "#1A1A1A" }}>Home</Link>
            {navGroups.map((group) => (
              <div key={group.name} className="relative" onMouseLeave={() => setOpenGroup(null)}>
                <button onMouseEnter={() => setOpenGroup(group.name)} onClick={() => setOpenGroup(openGroup === group.name ? null : group.name)} className="flex items-center gap-1 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg" style={{ color: "#1A1A1A" }}>{group.name}<ChevronDown className="h-3 w-3" /></button>
                {openGroup === group.name && <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{group.links.map((link) => <Link key={link.path} to={link.path} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">{link.name}</Link>)}</div>}
              </div>
            ))}
            {false && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={
                  isActive(link.path)
                    ? {
                        color: "#1A1A1A",
                        backgroundColor: "rgba(212,175,55,0.2)",
                      }
                    : { color: "#1A1A1A" }
                }
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-80 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  style={{ color: "#1A1A1A" }}
                  className="hover:opacity-80 transition-opacity text-xs xl:text-sm"
                >
                  <LogOut className="w-3 h-3 xl:w-4 xl:h-4 mr-1 xl:mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle - visible below lg:992px */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors btn-touch"
            style={{ color: "#1A1A1A" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 xs:w-6 xs:h-6" />
            ) : (
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - visible below lg:992px */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: "#F5E6D3",
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 py-3 xs:py-4 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 xs:py-3 text-sm font-medium rounded-lg" style={{ color: "#1A1A1A" }}>Home</Link>
            {navGroups.map((group) => <div key={group.name} className="pt-2"><p className="px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">{group.name}</p>{group.links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={
                  isActive(link.path)
                    ? {
                        color: "#1A1A1A",
                        backgroundColor: "rgba(212,175,55,0.2)",
                      }
                    : { color: "#1A1A1A" }
                }
                className="block px-4 py-2.5 xs:py-3 text-sm font-medium rounded-lg transition-all hover:opacity-80"
              >
                {link.name}
              </Link>
            ))}</div>)}
            {isAuthenticated && (
              <div
                className="pt-3 xs:pt-4 space-y-2"
                style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}
              >
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    style={{ color: "#1A1A1A" }}
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
