import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.jsx";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Buy", path: "/buy" },
    { name: "Rent", path: "/rent" },
    { name: "Sell", path: "/sell" },
    { name: "Properties", path: "/properties" },
    { name: "Services", path: "/services" },
    { name: "EPAN", path: "/epan" },
    { name: "Agents", path: "/agents" },
    { name: "Reviews", path: "/reviews" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.png"
              alt="Luxury Property"
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain"
              width="160"
              height="80"
              style={{ filter: "brightness(1) contrast(1)", maxWidth: "160px" }}
              loading="eager"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
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
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-80"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  style={{ color: "#1A1A1A" }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#1A1A1A" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t"
          style={{
            backgroundColor: "#F5E6D3",
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
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
                className="block px-4 py-3 text-sm font-medium rounded-lg transition-all hover:opacity-80"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <div
                className="pt-4 space-y-2"
                style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}
              >
                <>
                  <Button
                    variant="ghost"
                    className="w-full"
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
