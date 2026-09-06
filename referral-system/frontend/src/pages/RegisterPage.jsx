/**
 * RegisterPage.jsx
 * ----------------
 * Responsive consultant registration page (React + Tailwind CSS).
 *
 * Features:
 *   - Extracts `?ref=CODE` from the URL search params.
 *   - Collects Full Name, Phone, Email, Bank Name, Account Number, Account Name.
 *   - Submits to the backend registration endpoint.
 *   - On success, shows the user's referral link + WhatsApp share button.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export default function RegisterPage() {
  // Extract the `ref` parameter from the URL (e.g. /register?ref=ABC12345)
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  // Form state
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { referralLink, whatsappShareUrl }

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        ref: refCode || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {success ? (
          <SuccessState
            referralLink={success.referralLink}
            whatsappShareUrl={success.whatsappShareUrl}
          />
        ) : (
          <RegistrationForm
            form={form}
            refCode={refCode}
            loading={loading}
            error={error}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Registration Form
// ----------------------------------------------------------------------------
function RegistrationForm({ form, refCode, loading, error, onChange, onSubmit }) {
  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition';

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Become a Luxury Property Consultant
        </h1>
        <p className="text-slate-400">
          Join Luxury Properties Ltd and earn commissions up to 4 generations deep.
        </p>
        {refCode && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm">
            <span>🎯</span>
            Referred by code: <strong className="font-mono">{refCode}</strong>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={onChange}
            required
            placeholder="e.g. Adaeze Okafor"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={onChange}
              required
              placeholder="+234 800 000 0000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bank_name"
              value={form.bank_name}
              onChange={onChange}
              placeholder="e.g. GTBank"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              value={form.account_number}
              onChange={onChange}
              placeholder="0123456789"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              name="account_name"
              value={form.account_name}
              onChange={onChange}
              placeholder="e.g. Adaeze Okafor"
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Registering...' : 'Register as Consultant'}
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Success State — Referral Link + WhatsApp Share
// ----------------------------------------------------------------------------
function SuccessState({ referralLink, whatsappShareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = referralLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        🎉 Welcome to the Team!
      </h2>
      <p className="text-slate-400 mb-8">
        Your consultant account is ready. Share your referral link to start
        earning commissions on every deal — up to 4 generations deep!
      </p>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Referral Link
        </label>
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg p-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-transparent text-white text-sm px-2 py-1 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-md transition whitespace-nowrap"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* WhatsApp Share Button */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Share to WhatsApp
      </a>

      <p className="mt-4 text-xs text-slate-500">
        Tip: Share this link with friends & colleagues. You earn 50% on direct
        deals, 20% on 2nd gen, 15% on 3rd gen, and 15% on 4th gen!
      </p>
    </div>
  );
}