import { useEffect, useState } from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";

export default function ReferralAdminPage() {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { supabase.functions.invoke("admin-referral-dashboard").then(({ data: result, error: invokeError }) => { if (invokeError || !result?.success) setError(result?.error || "You are not authorised to access referral administration."); else setData(result.data); }); }, []);
  return <><Header /><main className="min-h-screen bg-slate-50 py-12"><div className="mx-auto max-w-6xl px-4"><h1 className="text-3xl font-semibold">Referral administration</h1>{error ? <p className="mt-5 rounded bg-red-50 p-4 text-red-700">{error}</p> : !data ? <p className="mt-5">Loading…</p> : <><div className="mt-6 grid gap-4 md:grid-cols-3"><Card label="Consultants" value={data.stats.consultants} /><Card label="Referral deals" value={data.stats.deals} /><Card label="Pending commissions" value={`₦${Number(data.stats.pendingCommission).toLocaleString()}`} /></div><section className="mt-7 rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Recent consultants</h2>{data.consultants.map((item) => <div key={item.id} className="flex justify-between border-b py-3 text-sm"><span>{item.full_name}<small className="ml-2 text-slate-500">{item.referral_code}</small></span><span>{item.email}</span></div>)}</section></>}</div></main><Footer /></>;
}
function Card({ label, value }) { return <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
