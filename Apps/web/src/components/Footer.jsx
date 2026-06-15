import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb
        .collection("newsletter")
        .create({ email }, { $autoCancel: false });
      toast.success("Subscribed to newsletter");
      setEmail("");
    } catch (error) {
      if (error.message.includes("duplicate")) {
        toast.error("Email already subscribed");
      } else {
        toast.error("Subscription failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ backgroundColor: "#0B1120", color: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <img
                src="https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.png"
                alt="Luxury Property"
                className="h-32 w-auto object-contain"
                style={{ maxWidth: "280px" }}
                loading="lazy"
              />
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Your trusted partner in finding the perfect property. We provide
              professional, innovative real estate solutions.
            </p>
            <div className="flex space-x-3">
              {[
                {
                  href: "https://web.facebook.com/agene.sunday",
                  icon: <Facebook className="w-4 h-4" />,
                },
                {
                  href: "https://www.instagram.com/luxurypropertiesltd/",
                  icon: <Instagram className="w-4 h-4" />,
                },
                {
                  href: "https://twitter.com",
                  icon: <Twitter className="w-4 h-4" />,
                },
                {
                  href: "https://linkedin.com",
                  icon: <Linkedin className="w-4 h-4" />,
                },
              ].map(({ href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.15)",
                    color: "#D4AF37",
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Browse Properties", path: "/properties" },
                { label: "Buy Property", path: "/buy" },
                { label: "Rent Property", path: "/rent" },
                { label: "Sell Property", path: "/sell" },
                { label: "Our Agents", path: "/agents" },
                { label: "FAQ", path: "/faq" },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                    onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255,255,255,0.8)")
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: "#D4AF37" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  +234 703 972 6375
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: "#D4AF37" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  +234 913 798 1102
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: "#D4AF37" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  +234 706 928 6610
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: "#D4AF37" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  info@luxurypropertiesltd.com
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  style={{ color: "#D4AF37" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  9 Alfa Sanni Street, Pedro, Gbagada, Lagos, Nigeria
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Newsletter
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Subscribe to get the latest property updates and market insights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                }}
              />
              <Button
                type="submit"
                className="w-full font-semibold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: "#D4AF37",
                  color: "#0B1120",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            © 2026 Luxury Properties Ltd. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms of Service", path: "/terms" },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.6)")
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
