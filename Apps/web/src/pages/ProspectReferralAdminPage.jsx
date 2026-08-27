import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";

const STATUS_OPTIONS = ["New", "Contacted", "Closed"];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ProspectReferralAdminPage() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadReferrals() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-prospect-referrals", { body: { action: "list" } });
    if (error || !data?.success) {
      setForbidden(data?.error === "FORBIDDEN");
      toast.error(data?.error === "FORBIDDEN" ? "You are not authorised to view prospect referrals." : "Could not load prospect referrals.");
    } else {
      setForbidden(false);
      setReferrals(data.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadReferrals(); }, []);

  const filteredReferrals = useMemo(() => {
    const term = search.trim().toLowerCase();
    return referrals.filter((referral) => {
      const searchable = [referral.submitter_name, referral.submitter_phone, referral.prospect_name, referral.prospect_phone, referral.property_suggestion, referral.submitter_email, referral.prospect_email].join(" ").toLowerCase();
      const submittedAt = new Date(referral.submitted_at);
      const afterStart = !fromDate || submittedAt >= new Date(`${fromDate}T00:00:00`);
      const beforeEnd = !toDate || submittedAt <= new Date(`${toDate}T23:59:59.999`);
      return (!term || searchable.includes(term)) && afterStart && beforeEnd;
    });
  }, [referrals, search, fromDate, toDate]);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    const { data, error } = await supabase.functions.invoke("admin-prospect-referrals", { body: { action: "update-status", id, status } });
    if (error || !data?.success) {
      toast.error(data?.error || "Could not update referral status.");
    } else {
      setReferrals((current) => current.map((referral) => referral.id === id ? { ...referral, status, updated_at: data.data.updated_at } : referral));
      toast.success("Referral status updated.");
    }
    setUpdatingId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Admin Dashboard</p><h1 className="text-3xl font-bold text-stone-900">Prospect Referrals</h1></div>
          <button type="button" onClick={loadReferrals} disabled={loading} className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"><RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</button>
        </div>
        {forbidden ? <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800"><h2 className="font-semibold">Access denied</h2><p className="mt-1 text-sm">Your account is not authorised to view prospect referrals.</p></section> : <>
          <section className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <label className="min-w-[220px] flex-1 text-sm font-semibold text-stone-700"><span className="mb-1 block">Search referrals</span><span className="flex items-center gap-2 rounded border border-stone-300 px-3"><Search className="h-4 w-4 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-10 w-full border-0 p-0 text-sm outline-none" placeholder="Name, phone, property or email" /></span></label>
            <label className="text-sm font-semibold text-stone-700"><span className="mb-1 block">From</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="min-h-10 rounded border border-stone-300 px-3 text-sm font-normal" /></label>
            <label className="text-sm font-semibold text-stone-700"><span className="mb-1 block">To</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="min-h-10 rounded border border-stone-300 px-3 text-sm font-normal" /></label>
          </section>
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 px-4 py-3 text-sm text-stone-500">{filteredReferrals.length} referral{filteredReferrals.length === 1 ? "" : "s"}, newest first</div>
            {loading ? <p className="p-6 text-stone-500">Loading prospect referrals...</p> : filteredReferrals.length === 0 ? <p className="p-6 text-stone-500">No prospect referrals match these filters.</p> : <div className="overflow-x-auto"><table className="min-w-[1100px] w-full text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Referrer</th><th className="px-4 py-3">Property suggestion</th><th className="px-4 py-3">Relationship</th><th className="px-4 py-3">Prospect</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{filteredReferrals.map((referral) => <tr key={referral.id} className="align-top"><td className="whitespace-nowrap px-4 py-4 text-stone-600">{formatDate(referral.submitted_at)}</td><td className="px-4 py-4"><strong className="block text-stone-900">{referral.submitter_name}</strong><span className="block text-stone-600">{referral.submitter_phone}</span><span className="block text-stone-500">{referral.submitter_email}</span></td><td className="max-w-[220px] px-4 py-4 text-stone-700">{referral.property_suggestion}</td><td className="px-4 py-4 text-stone-700">{referral.relationship}</td><td className="px-4 py-4"><strong className="block text-stone-900">{referral.prospect_name}</strong><span className="block text-stone-600">{referral.prospect_phone}</span><span className="block text-stone-500">{referral.prospect_email}</span><span className="block text-xs text-stone-500">{referral.email_sent ? "Email sent" : "Email not sent"}</span>{referral.delivery_error && <span className="block max-w-[220px] text-xs text-red-600" title={referral.delivery_error}>Delivery issue recorded</span>}</td><td className="px-4 py-4"><select value={referral.status || "New"} onChange={(event) => updateStatus(referral.id, event.target.value)} disabled={updatingId === referral.id} className="rounded border border-stone-300 bg-white px-2 py-2 text-sm disabled:opacity-50">{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}
          </section>
        </>}
      </main>
      <Footer />
    </div>
  );
}