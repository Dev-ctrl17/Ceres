import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronRight,
  Home,
  MapPin,
  Scale,
  CheckCircle2,
  Building2,
  UserCheck,
  Award,
  BookOpen,
  FileText,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Clock,
  GraduationCap,
  ExternalLink,
  Phone,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

export interface GainHighlight {
  title: string;
  icon: LucideIcon;
}

export const NyscLegalAdminPageTSX: React.FC = () => {
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const subjectLine: string = "NYSC LEGAL & ADMINISTRATIVE SUPPORT";
  const whatsappNumber: string = "2349056201176";
  const emailAddress: string = "info@luxurypropertiesltd.com.ng";
  const pageUrl: string =
    typeof window !== "undefined"
      ? window.location.href
      : "https://luxurypropertiesltd.com.ng/careers/nysc-legal-admin";

  const whatsappMessage: string = encodeURIComponent(
    "Hello Luxury Properties Ltd, I am a serving NYSC Corps Member (Law background) interested in applying for the NYSC Legal & Administrative Support position in Pedro Gbagada, Lagos. Please guide me on submitting my application."
  );

  const whatsappUrl: string = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const emailUrl: string = `mailto:${emailAddress}?subject=${encodeURIComponent(
    subjectLine
  )}&body=${encodeURIComponent(
    "Dear Hiring Manager,\n\nI am a serving NYSC Corps Member in Lagos with a Law background, writing to express my interest in the Legal & Administrative Support position at Luxury Properties Ltd.\n\nPlease find attached:\n1. My CV\n2. Brief Introduction\n3. NYSC PPA / Serving Details\n\nThank you for your consideration.\n\nBest regards,"
  )}`;

  const handleCopySubject = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(subjectLine);
      setCopiedSubject(true);
      toast.success("Subject line copied to clipboard");
      setTimeout(() => setCopiedSubject(false), 3000);
    } catch (err) {
      toast.error("Failed to copy subject line");
    }
  };

  const handleSharePage = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NYSC Corps Member – Legal & Administrative Support | Luxury Properties Ltd",
          text: "NYSC Opportunity in Lagos: Legal & Administrative Support at Luxury Properties Ltd.",
          url: pageUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopiedLink(true);
        toast.success("Page link copied to clipboard");
        setTimeout(() => setCopiedLink(false), 3000);
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const responsibilities: string[] = [
    "Basic legal and administrative research",
    "Preparation, review, and organization of company documents",
    "Property-related documentation and administrative processes",
    "Drafting and reviewing routine correspondence and documents",
    "Maintaining proper company records and files",
    "Supporting client and stakeholder documentation",
    "Administrative compliance and documentation",
    "Assisting with real estate transaction documentation",
    "General corporate administrative duties",
    "Liaising with relevant professionals, clients, and service providers when required",
  ];

  const candidateProfile: string[] = [
    "Studied Law (LL.B)",
    "Is currently serving in Lagos",
    "Has good knowledge of Microsoft Word and basic office tools",
    "Has excellent written and verbal communication skills",
    "Is organized, responsible, and detail-oriented",
    "Can handle confidential company information professionally",
    "Is willing to learn and take initiative",
    "Has an interest in corporate law, property law, real estate, or business administration",
  ];

  const gainHighlights: GainHighlight[] = [
    { title: "Property & Real Estate Documentation", icon: Scale },
    { title: "Corporate Administration", icon: Building2 },
    { title: "Contract & Document Management", icon: FileText },
    { title: "Real Estate Transactions", icon: Home },
    { title: "Client & Stakeholder Management", icon: UserCheck },
    { title: "Business Operations", icon: BookOpen },
    { title: "Entrepreneurship & Professional Development", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* SEO Metadata */}
      <Helmet>
        <title>NYSC Corps Member – Legal & Administrative Support | Luxury Properties Ltd</title>
        <meta
          name="description"
          content="Luxury Properties Ltd is seeking a serving NYSC Corps Member with a Law background for Legal & Administrative Support in Pedro Gbagada, Lagos, Nigeria."
        />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/careers/nysc-legal-admin" />
      </Helmet>

      {/* Main Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-amber-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/about" className="hover:text-amber-600 transition-colors">
            Careers
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            NYSC Legal & Administrative Support
          </span>
        </nav>

        {/* Hero Header Card */}
        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
              NYSC Recruitment
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Pedro Gbagada, Lagos
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Legal & Administrative
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            NYSC Corps Member – Legal & Administrative Support
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-4">
            Luxury Properties Ltd, a growing real estate company in Lagos, is seeking a serving NYSC Corps Member with a Law background to join our team and support our legal and administrative operations.
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            This is an excellent opportunity for a young legal professional who wants to gain practical corporate, property and administrative experience while completing their NYSC service.
          </p>

          {/* Key Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Company</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                Luxury Properties Ltd
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Location</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                Pedro Gbagada, Lagos
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Target Cadre</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                Law (LL.B)
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Role Type</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                NYSC PPA Opportunity
              </span>
            </div>
          </div>
        </header>

        {/* 70/30 Two-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          {/* Main Content (Left Column - 70%) */}
          <div className="lg:col-span-7 space-y-8">
            {/* About The Opportunity */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                About The Opportunity
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
                Luxury Properties Ltd is a growing real estate agency and advisory firm operating in Lagos. We are seeking a serving NYSC Corps Member with a background in Law (LL.B) to support our legal, regulatory, and corporate administrative processes.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                In this role, you will get firsthand practical exposure to property documentation, real estate transactions, and corporate governance, while working closely with our executive leadership team.
              </p>
            </section>

            {/* Key Responsibilities */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Key Responsibilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                The successful candidate will assist with:
              </p>

              <ul className="space-y-3">
                {responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Who We Are Looking For */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Who We Are Looking For
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                We are particularly interested in a Corps Member who:
              </p>

              <ul className="space-y-3 mb-6">
                {candidateProfile.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Call to Bar Note */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-amber-500 p-4 rounded-r-xl text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">Note:</span> Call to Bar is an advantage but not compulsory.
              </div>
            </section>

            {/* What You'll Gain */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                What You'll Gain
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                At Luxury Properties Ltd, you will have the opportunity to gain practical exposure to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {gainHighlights.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                    >
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mentorship Note */}
              <div className="bg-stone-900 text-white rounded-xl p-5 flex items-start gap-4">
                <GraduationCap className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  You will work directly with the Managing Director and gain practical experience that can be valuable beyond your NYSC year.
                </p>
              </div>
            </section>
          </div>

          {/* Application Sidebar (Right Column - 30%) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">How to Apply</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interested Corps Members should send:
                </p>
              </div>

              {/* Checklist */}
              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-b border-slate-100 dark:border-slate-800 py-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>1. Updated CV</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>2. Brief introduction</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>3. Preferred NYSC PPA / serving location (if applicable)</span>
                </li>
              </ol>

              {/* Email Subject Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Email Subject Line:
                </label>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 break-all select-all">
                    {subjectLine}
                  </span>
                  <button
                    onClick={handleCopySubject}
                    className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors shrink-0"
                    title="Copy Subject Line"
                    aria-label="Copy Subject Line"
                  >
                    {copiedSubject ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Apply Action Buttons */}
              <div className="space-y-3 pt-1">
                {/* WhatsApp Apply */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Apply via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* Email Apply */}
                <a
                  href={emailUrl}
                  className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Apply via Email</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Share Button */}
              <button
                onClick={handleSharePage}
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedLink ? "Link Copied!" : "Share Opportunity"}</span>
              </button>

              {/* Location Summary */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300 block">Location:</strong>
                    Pedro Gbagada, Lagos, Nigeria
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>+234 905 620 1176</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">info@luxurypropertiesltd.com.ng</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NyscLegalAdminPageTSX;
