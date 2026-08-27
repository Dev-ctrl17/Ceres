import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import "./ProspectReferralPage.css";

const initialValues = {
  prospectName: "",
  prospectPhone: "",
  prospectEmail: "",
  propertySuggestion: "",
  relationship: "",
  submitterName: "",
  submitterPhone: "",
  submitterEmail: "",
};

const phonePattern = /^(?:\+234|234|0)(?:70|71|80|81|90|91)\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  Object.entries(values).forEach(([field, value]) => {
    if (!value.trim()) errors[field] = "This field is required.";
  });
  ["prospectPhone", "submitterPhone"].forEach((field) => {
    if (values[field].trim() && !phonePattern.test(values[field].replace(/[\s()-]/g, ""))) {
      errors[field] = "Enter a valid Nigerian phone number.";
    }
  });
  if (values.submitterEmail.trim() && !emailPattern.test(values.submitterEmail.trim())) {
    errors.submitterEmail = "Enter a valid email address.";
  }
  return errors;
}

function Field({ label, name, type = "text", placeholder, values, errors, onChange }) {
  return (
    <label className="prospect-referral-field">
      <span>{label}</span>
      <input name={name} type={type} value={values[name]} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(errors[name])} />
      {errors[name] && <small className="prospect-referral-error">{errors[name]}</small>}
    </label>
  );
}

export default function ProspectReferralForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: "Please review the highlighted fields." });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch("/api/prospect-referral/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "We could not submit the referral.");
      setValues(initialValues);
      setErrors({});
      setStatus({ type: "success", message: "Thank you. We've received the referral and will be in touch." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "We could not submit the referral. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prospect-referral-page">
      <Helmet>
        <title>Refer & Earn | Luxury Properties Ltd</title>
        <meta name="description" content="Refer a promising property prospect to Luxury Properties Ltd." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/refer-and-earn" />
      </Helmet>
      <Header />
      <main className="prospect-referral-main">
        <section className="prospect-referral-intro">
          <p className="prospect-referral-eyebrow">A thoughtful introduction can open the right door</p>
          <h1>Refer a prospect.<br /><em>Earn trust first.</em></h1>
          <p className="prospect-referral-lede">Know someone considering a remarkable property? Share their details with our private client team and let us take it from there.</p>
          <div className="prospect-referral-note"><CheckCircle2 size={18} /> Your introduction is handled discreetly by our team.</div>
        </section>
        <section className="prospect-referral-form-panel" aria-labelledby="prospect-referral-form-title">
          <div className="prospect-referral-panel-heading"><span>01</span><div><h2 id="prospect-referral-form-title">Tell us about the prospect</h2><p>The person you are referring to Luxury Properties Ltd.</p></div></div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="prospect-referral-grid">
              <Field label="Full name" name="prospectName" placeholder="e.g. Amaka Okafor" values={values} errors={errors} onChange={handleChange} />
              <Field label="Phone number" name="prospectPhone" type="tel" placeholder="e.g. +234 801 234 5678" values={values} errors={errors} onChange={handleChange} />
              <Field label="Email address" name="prospectEmail" type="email" placeholder="prospect@example.com" values={values} errors={errors} onChange={handleChange} />
              <Field label="Property suggestion" name="propertySuggestion" placeholder="e.g. ₦5.5B Ikoyi Luxury Property" values={values} errors={errors} onChange={handleChange} />
              <label className="prospect-referral-field"><span>Relationship to you</span><select name="relationship" value={values.relationship} onChange={handleChange} aria-invalid={Boolean(errors.relationship)}><option value="">Select relationship</option><option>Friend</option><option>Family</option><option>Business Associate</option><option>Colleague</option><option>Other</option></select>{errors.relationship && <small className="prospect-referral-error">{errors.relationship}</small>}</label>
            </div>
            <div className="prospect-referral-panel-heading prospect-referral-subheading"><span>02</span><div><h2>Your details</h2><p>So we know who made the introduction.</p></div></div>
            <div className="prospect-referral-grid">
              <Field label="Full name" name="submitterName" placeholder="e.g. Tunde Adebayo" values={values} errors={errors} onChange={handleChange} />
              <Field label="Phone number" name="submitterPhone" type="tel" placeholder="e.g. +234 801 234 5678" values={values} errors={errors} onChange={handleChange} />
              <Field label="Email address" name="submitterEmail" type="email" placeholder="you@example.com" values={values} errors={errors} onChange={handleChange} />
            </div>
            {status.message && <p className={`prospect-referral-status prospect-referral-status-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p>}
            <button className="prospect-referral-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="prospect-referral-spinner" size={18} /> Sending...</> : <>Send referral <ArrowRight size={18} /></>}</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}