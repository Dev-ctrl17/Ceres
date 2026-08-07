import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";

const initialForm = { full_name: "", phone_number: "", email: "", bank_name: "", account_number: "", account_name: "" };
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function Field({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}{required ? " *" : ""}
      <input required={required} type={type} name={name} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900" />
    </label>
  );
}

export default function ConsultantRegistrationPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileElement = useRef(null);
  const referralCode = searchParams.get("ref") || "";

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileElement.current) return undefined;
    const render = () => window.turnstile?.render(turnstileElement.current, { sitekey: TURNSTILE_SITE_KEY, callback: setTurnstileToken, "expired-callback": () => setTurnstileToken("") });
    if (window.turnstile) { render(); return undefined; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    if (!TURNSTILE_SITE_KEY) { setLoading(false); setError("Registration is temporarily unavailable. Please contact support."); return; }
    if (!turnstileToken) { setLoading(false); setError("Please complete the security check."); return; }
    const { data, error: invokeError } = await supabase.functions.invoke("register-consultant", { body: { ...form, ref: referralCode || null, turnstile_token: turnstileToken } });
    setLoading(false);
    if (invokeError || !data?.success) {
      setError(data?.error || invokeError?.message || "We could not complete your registration. Please try again.");
      return;
    }
    setResult(data.data);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(result.referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Helmet><title>Join as a Consultant | Luxury Properties Ltd</title><meta name="description" content="Register as a Luxury Properties Ltd consultant and share your referral link." /><link rel="canonical" href="https://luxurypropertiesltd.com.ng/register" /></Helmet>
      <Header />
      <main className="min-h-screen bg-stone-50 py-14 sm:py-20"><section className="mx-auto w-full max-w-2xl px-4 sm:px-6"><div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10">
        {result ? <div className="text-center"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Registration complete</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome to the consultant network</h1><p className="mt-3 text-slate-600">Share your personal referral link to grow your network.</p><div className="mt-7 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"><input className="min-w-0 flex-1 bg-transparent px-2 text-sm" readOnly value={result.referralLink} aria-label="Referral link" /><button type="button" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={copyLink}>{copied ? "Copied" : "Copy"}</button></div><a className="mt-4 inline-flex w-full justify-center rounded-md bg-green-600 px-4 py-3 font-semibold text-white" href={result.whatsappShareUrl} target="_blank" rel="noreferrer">Share on WhatsApp</a></div> : <><p className="text-sm font-semibold uppercase tracking-wider text-primary">Luxury Properties Ltd</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Become a consultant</h1><p className="mt-3 text-slate-600">Join our referral network and earn on completed deals.</p>{referralCode && <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">You were referred by code: <strong>{referralCode}</strong></p>}<form className="mt-7 space-y-4" onSubmit={submit}><Field label="Full name" name="full_name" value={form.full_name} onChange={setForm} required /><div className="grid gap-4 sm:grid-cols-2"><Field label="Email" name="email" type="email" value={form.email} onChange={setForm} required /><Field label="Phone number" name="phone_number" type="tel" value={form.phone_number} onChange={setForm} required /></div><div className="grid gap-4 sm:grid-cols-3"><Field label="Bank name" name="bank_name" value={form.bank_name} onChange={setForm} /><Field label="Account number" name="account_number" value={form.account_number} onChange={setForm} /><Field label="Account name" name="account_name" value={form.account_name} onChange={setForm} /></div><div ref={turnstileElement} className="min-h-[65px]" />{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading || !turnstileToken} className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-slate-900 disabled:opacity-60">{loading ? "Registering..." : "Register as a consultant"}</button></form></>}
      </div></section></main>
      <Footer />
    </>
  );
}
