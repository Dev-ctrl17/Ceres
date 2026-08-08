import { useEffect, useState } from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import supabase from "@/lib/supabaseClient";

export default function ReferralAdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    supabase.functions.invoke("admin-referral-dashboard").then(({ data: result, error: invokeError }) => {
      if (invokeError || !result?.success) setError(result?.error || "You are not authorised to access referral administration.");
      else setData(result.data);
    });
  }, []);

  async function createKey() {
    setCreatingKey(true); setError("");
    const { data: result, error: invokeError } = await supabase.functions.invoke("estateos-api-key-admin", { body: { action: "create", name: "EstateOS Production 2" } });
    setCreatingKey(false);
    if (invokeError || !result?.success) setError(result?.error || "Could not create the API key.");
    else setApiKey(result.key);
  }

  return <><Header /><main className="min-h-screen bg-slate-50 py-12"><div className="mx-auto max-w-6xl px-4"><h1 className="text-3xl font-semibold">Referral administration</h1>{error && <p className="mt-5 rounded bg-red-50 p-4 text-red-700">{error}</p>}{!data ? <p className="mt-5">Loading…</p> : <><div className="mt-6 grid gap-4 md:grid-cols-3"><Card label="Consultants" value={data.stats.consultants} /><Card label="Referral deals" value={data.stats.deals} /><Card label="Pending commissions" value={`₦${Number(data.stats.pendingCommission).toLocaleString()}`} /></div><section className="mt-7 rounded-xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">EstateOS API key</h2><p className="text-sm text-slate-500">Create a replacement read-only key, test it, then revoke the old one.</p></div><button onClick={createKey} disabled={creatingKey} className="rounded bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-50">{creatingKey ? "Creating…" : "Create EstateOS Production 2"}</button></div>{apiKey && <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-4"><p className="text-sm font-semibold">Copy this key now. It cannot be displayed again.</p><code className="mt-2 block break-all rounded bg-white p-3 text-sm">{apiKey}</code><button onClick={() => navigator.clipboard.writeText(apiKey)} className="mt-3 rounded bg-slate-800 px-3 py-2 text-sm text-white">Copy key</button></div>}</section><section className="mt-7 rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Recent consultants</h2>{data.consultants.map((item) => <div key={item.id} className="flex justify-between border-b py-3 text-sm"><span>{item.full_name}<small className="ml-2 text-slate-500">{item.referral_code}</small></span><span>{item.email}</span></div>)}</section></>}</div></main><Footer /></>;
}
function Card({ label, value }) { return <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
