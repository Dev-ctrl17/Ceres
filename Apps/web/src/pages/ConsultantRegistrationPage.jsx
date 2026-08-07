import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const initialForm = { first_name: "", last_name: "", phone_number: "", email: "", confirm_email: "", date_of_birth: "", gender: "", city: "", address: "", state: "", country: "Nigeria", bank_name: "", account_number: "", account_name: "", accepted_terms: false };
const fieldClass = "mt-1 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

function Field({ label, name, type = "text", form, setForm, required = false, children }) {
  return <label className="block text-xs font-medium text-slate-700">{label}{required && " *"}{children || <input className={fieldClass} required={required} type={type} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} />}</label>;
}

export default function ConsultantRegistrationPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileElement = useRef(null);
  const referralCode = searchParams.get("ref") || "";

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileElement.current) return undefined;
    const render = () => window.turnstile?.render(turnstileElement.current, { sitekey: TURNSTILE_SITE_KEY, callback: setTurnstileToken, "expired-callback": () => setTurnstileToken("") });
    if (window.turnstile) { render(); return undefined; }
    const script = document.createElement("script"); script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.onload = render; document.head.appendChild(script);
    return () => script.remove();
  }, []);

  async function submit(event) {
    event.preventDefault(); setError("");
    if (!TURNSTILE_SITE_KEY) return setError("Turnstile is not configured in Vercel yet. Add VITE_TURNSTILE_SITE_KEY, redeploy, then try again.");
    if (!turnstileToken) return setError("Please complete the security check before submitting.");
    if (form.email !== form.confirm_email) return setError("Email addresses do not match.");
    if (!form.accepted_terms) return setError("Please agree to the terms and conditions.");
    setLoading(true);
    const { confirm_email, accepted_terms, first_name, last_name, ...payload } = form;
    const { data, error: invokeError } = await supabase.functions.invoke("register-consultant", { body: { ...payload, full_name: `${first_name} ${last_name}`.trim(), ref: referralCode || null, turnstile_token: turnstileToken } });
    setLoading(false);
    if (invokeError || !data?.success) return setError(data?.error || invokeError?.message || "Registration failed. Please try again.");
    setResult(data.data);
  }

  return <><Helmet><title>Registration Form | Luxury Properties Ltd</title><link rel="canonical" href="https://luxurypropertiesltd.com.ng/register" /></Helmet><Header />
    <main className="min-h-screen bg-white py-10 sm:py-16"><section className="mx-auto w-full max-w-4xl px-4"><h1 className="text-center text-2xl font-semibold text-slate-800">Registration Form</h1><p className="mb-5 text-center text-xs text-slate-400">Please fill in your details correctly</p>
      {referralCode && <div className="mb-8 flex items-center justify-between rounded-md bg-amber-500 px-5 py-3 text-center text-xs font-medium text-white">You are being referred by {referralCode}<span>×</span></div>}
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {result ? <div className="py-12 text-center"><h2 className="text-2xl font-semibold text-slate-800">Registration complete</h2><p className="mt-3 text-sm text-slate-500">Your referral link is ready.</p><input readOnly value={result.referralLink} className="mt-6 w-full rounded border bg-slate-50 p-3 text-sm" /></div> : <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><Field label="First Name" name="first_name" form={form} setForm={setForm} required /><Field label="Last Name" name="last_name" form={form} setForm={setForm} required /><Field label="Mobile number" name="phone_number" type="tel" form={form} setForm={setForm} required /></div><div className="grid gap-4 md:grid-cols-2"><Field label="Email Address" name="email" type="email" form={form} setForm={setForm} required /><Field label="Confirm Email Address" name="confirm_email" type="email" form={form} setForm={setForm} required /></div><div className="grid gap-4 md:grid-cols-2"><Field label="Date of birth" name="date_of_birth" type="date" form={form} setForm={setForm} /><Field label="Gender" name="gender" form={form} setForm={setForm}><select className={fieldClass} value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></Field><Field label="Address" name="address" form={form} setForm={setForm} /><Field label="City" name="city" form={form} setForm={setForm} /><Field label="State" name="state" form={form} setForm={setForm} /><Field label="Country" name="country" form={form} setForm={setForm} /></div><div className="grid gap-4 md:grid-cols-3"><Field label="Account number" name="account_number" form={form} setForm={setForm} required /><Field label="Bank" name="bank_name" form={form} setForm={setForm} required /><Field label="Account Name" name="account_name" form={form} setForm={setForm} required /></div><label className="flex items-center justify-center gap-2 border-t pt-4 text-xs text-slate-600"><input type="checkbox" checked={form.accepted_terms} onChange={(event) => setForm((current) => ({ ...current, accepted_terms: event.target.checked }))} />I agree to terms and conditions</label><div ref={turnstileElement} className="flex min-h-[65px] justify-center" />{error && <p role="alert" className="rounded bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}<div className="flex justify-center gap-3 border-t pt-4"><button type="reset" onClick={() => setForm(initialForm)} className="rounded bg-amber-500 px-8 py-2.5 text-sm font-medium text-white">Cancel</button><button disabled={loading || !turnstileToken} className="rounded bg-teal-500 px-8 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Submitting..." : "Submit"}</button></div></form>}
      </div></section></main><Footer /></>;
}
