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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";
import { validateEmail } from "@/services/emailValidation";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Verify email via Mailboxlayer
      const emailResult = await validateEmail(email);

      if (!emailResult.valid) {
        toast.error(emailResult.error || "Please enter a valid email address.");
        setLoading(false);
        return;
      }

      // Step 2: Subscribe to newsletter
      const { error } = await supabase.from("newsletter").insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast.error("Email already subscribed");
        } else {
          toast.error("Subscription failed. Please try again.");
        }
        return;
      }

      toast.success("Subscribed to newsletter");
      setEmail("");
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    {
      href: "https://web.facebook.com/agene.sunday",
      icon: <Facebook className="w-4 h-4" />,
      label: "Facebook",
    },
    {
      href: "https://www.instagram.com/luxurypropertiesltd/",
      icon: <Instagram className="w-4 h-4" />,
      label: "Instagram",
    },
    {
      href: "https://twitter.com",
      icon: <Twitter className="w-4 h-4" />,
      label: "Twitter",
    },
    {
      href: "https://linkedin.com",
      icon: <Linkedin className="w-4 h-4" />,
      label: "LinkedIn",
    },
  ];

  return (
    <footer style={{ backgroundColor: "#0B1120", color: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-12 xs:py-14 sm:py-16 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 xs:gap-10 sm:gap-10 md:gap-12 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <img
                src="https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.png"
                alt="Luxury Property"
                className="h-32 w-auto object-contain"
                width="280"
                height="128"
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
              {socialLinks.map(({ href, icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${label}`}
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
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Quick Links
            </h2>
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
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Contact Info
            </h2>
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
                  info@luxurypropertiesltd.com.ng
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
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "#D4AF37" }}
            >
              Newsletter
            </h2>
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
                aria-label="Email address for newsletter"
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
                aria-label="Subscribe to newsletter"
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
              { label: "Privacy Policy", path: "/privacy-policy" },
              { label: "Terms of Service", path: "/terms-conditions" },
              { label: "Company Registration", path: "/company-registration" },
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
