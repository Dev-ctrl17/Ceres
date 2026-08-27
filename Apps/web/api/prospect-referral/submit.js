import { createClient } from "@supabase/supabase-js";

const phonePattern = /^(?:\+234|234|0)(?:70|71|80|81|90|91)\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fields = ["prospectName", "prospectPhone", "prospectEmail", "propertySuggestion", "relationship", "submitterName", "submitterPhone", "submitterEmail"];

function validate(body) {
  const values = Object.fromEntries(fields.map((field) => [field, typeof body?.[field] === "string" ? body[field].trim() : ""]));
  if (fields.some((field) => !values[field])) return { error: "All referral fields are required." };
  if (!phonePattern.test(values.prospectPhone.replace(/[\s()-]/g, "")) || !phonePattern.test(values.submitterPhone.replace(/[\s()-]/g, ""))) return { error: "Enter valid Nigerian phone numbers." };
  if (!emailPattern.test(values.prospectEmail) || !emailPattern.test(values.submitterEmail)) return { error: "Enter valid email addresses." };
  return { values };
}

async function sendNotification(values, submittedAt) {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service_id: process.env.PROSPECT_REFERRAL_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID, template_id: process.env.PROSPECT_REFERRAL_EMAILJS_TEMPLATE_ID || "prospect_referral_notification", user_id: process.env.PROSPECT_REFERRAL_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY, template_params: { ...values, submitted_at: submittedAt, recipient_email: process.env.PROSPECT_REFERRAL_RECIPIENT || "info@luxurypropertiesltd.com.ng" } }) });
  if (!response.ok) throw new Error("Notification could not be sent.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed." });
  const { values, error } = validate(req.body);
  if (error) return res.status(400).json({ success: false, error });
  const submittedAt = new Date().toISOString();
  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: referral, error: insertError } = await supabase.from("prospect_referrals").insert({ prospect_name: values.prospectName, prospect_phone: values.prospectPhone, prospect_email: values.prospectEmail, property_suggestion: values.propertySuggestion, relationship: values.relationship, submitter_name: values.submitterName, submitter_phone: values.submitterPhone, submitter_email: values.submitterEmail, submitted_at: submittedAt, status: "New", email_sent: false }).select("id").single();
    if (insertError) throw insertError;
    const deliveryErrors = [];
    let emailSent = false;
    try {
      await sendNotification(values, submittedAt);
      emailSent = true;
    } catch (notificationError) {
      deliveryErrors.push(notificationError.message);
      console.error("Prospect referral notification failed", notificationError);
    }
    if (process.env.PROSPECT_REFERRAL_CRM_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(process.env.PROSPECT_REFERRAL_CRM_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, submitted_at: submittedAt }) });
        if (!webhookResponse.ok) throw new Error(`CRM webhook returned ${webhookResponse.status}.`);
      } catch (webhookError) {
        console.error("Prospect referral CRM webhook failed", webhookError);
        deliveryErrors.push(webhookError.message);
      }
    }
    const { error: deliveryUpdateError } = await supabase.from("prospect_referrals").update({ email_sent: emailSent, delivery_error: deliveryErrors.length ? deliveryErrors.join(" ") : null, updated_at: new Date().toISOString() }).eq("id", referral.id);
    if (deliveryUpdateError) console.error("Prospect referral delivery status update failed", deliveryUpdateError);
    return res.status(200).json({ success: true, deliveryWarning: deliveryErrors.length > 0 });
  } catch (submitError) {
    console.error("Prospect referral submission failed", submitError);
    return res.status(500).json({ success: false, error: "We could not process the referral. Please try again." });
  }
}