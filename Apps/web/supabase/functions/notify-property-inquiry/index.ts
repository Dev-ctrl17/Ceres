import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface PropertyInquiry {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferred_date: string;
  preferred_time: string;
  inquiry_type: string;
  status: string;
  is_contacted: boolean;
  created_at: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not set");
    }

    const payload = await req.json();
    const record: PropertyInquiry =
      payload.type === "INSERT" ? payload.record : payload;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff;
            padding: 32px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            margin: 8px 0 0;
            opacity: 0.85;
            font-size: 14px;
          }
          .content {
            padding: 32px 40px;
          }
          .field {
            margin-bottom: 16px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #888;
            font-weight: 600;
          }
          .value {
            font-size: 16px;
            color: #333;
            margin-top: 2px;
            font-weight: 500;
          }
          .schedule-box {
            background-color: #e8f4f8;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            display: flex;
            gap: 24px;
          }
          .divider {
            border: none;
            border-top: 1px solid #eee;
            margin: 24px 0;
          }
          .footer {
            background-color: #fafafa;
            padding: 16px 40px;
            text-align: center;
            font-size: 12px;
            color: #aaa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 New Property Viewing Request</h1>
            <p>A client wants to schedule a viewing</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Property ID</div>
              <div class="value">${record.property_id || "N/A"}</div>
            </div>

            <div class="schedule-box">
              <div class="field" style="margin-bottom:0;">
                <div class="label">Preferred Date</div>
                <div class="value">${record.preferred_date || "N/A"}</div>
              </div>
              <div class="field" style="margin-bottom:0;">
                <div class="label">Preferred Time</div>
                <div class="value">${record.preferred_time || "N/A"}</div>
              </div>
            </div>

            <hr class="divider" />

            <h3 style="margin: 0 0 16px; color: #333;">Client Details</h3>

            <div class="field">
              <div class="label">Name</div>
              <div class="value">${record.name}</div>
            </div>

            <div class="field">
              <div class="label">Email</div>
              <div class="value">
                <a href="mailto:${record.email}" style="color: #1a73e8; text-decoration: none;">
                  ${record.email}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="label">Phone</div>
              <div class="value">
                <a href="tel:${record.phone}" style="color: #1a73e8; text-decoration: none;">
                  ${record.phone}
                </a>
              </div>
            </div>

            ${record.message ? `
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${record.message}</div>
            </div>
            ` : ""}
          </div>
          <div class="footer">
            Luxury Properties Ltd &bull; Property Viewing Request Notification
          </div>
        </div>
      </body>
      </html>
    `;

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Luxury Properties",
          email: "info@luxurypropertiesltd.com.ng",
        },
        to: [
          {
            email: "info@luxurypropertiesltd.com.ng",
            name: "Luxury Properties Admin",
          },
        ],
        subject: `New Viewing Request: ${record.name} - ${record.preferred_date || ""}`,
        htmlContent: emailHtml,
      }),
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("Brevo API error:", responseData);
      return new Response(
        JSON.stringify({
          error: responseData.message || "Failed to send email via Brevo",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Property inquiry email sent successfully via Brevo:", responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
