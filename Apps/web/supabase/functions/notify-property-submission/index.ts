import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface PropertySubmission {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  property_type: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  images: string[];
  image_url: string;
  status: string;
  created_at: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not set");
    }

    // Parse the incoming webhook payload
    const payload = await req.json();

    // Supabase database webhooks wrap the record in a specific structure
    // The actual row data is in payload.record
    const record: PropertySubmission =
      payload.type === "INSERT" ? payload.record : payload;

    const formattedPrice = `₦${Number(record.price).toLocaleString()}`;

    // Build the image HTML
    const imageHtml = record.image_url
      ? `<img src="${record.image_url}" alt="${record.title}" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;" />`
      : "";

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
          .price {
            font-size: 22px;
            color: #e63946;
            font-weight: 700;
          }
          .property-type-badge {
            display: inline-block;
            background-color: #e8f4f8;
            color: #1a73e8;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 600;
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
          .status-badge {
            display: inline-block;
            background-color: #fff3cd;
            color: #856404;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 New Property Submission</h1>
            <p>A new property has been submitted for review</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Title</div>
              <div class="value">${record.title}</div>
            </div>

            <div class="field">
              <div class="label">Price</div>
              <div class="value price">${formattedPrice}</div>
            </div>

            <div class="field">
              <div class="label">Location</div>
              <div class="value">${record.location}</div>
            </div>

            <div class="field">
              <div class="label">Property Type</div>
              <div class="value">
                <span class="property-type-badge">${record.property_type}</span>
              </div>
            </div>

            ${record.description ? `
            <div class="field">
              <div class="label">Description</div>
              <div class="value">${record.description}</div>
            </div>
            ` : ""}

            <hr class="divider" />

            <h3 style="margin: 0 0 16px; color: #333;">Owner Information</h3>

            <div class="field">
              <div class="label">Name</div>
              <div class="value">${record.owner_name}</div>
            </div>

            <div class="field">
              <div class="label">Email</div>
              <div class="value">
                <a href="mailto:${record.owner_email}" style="color: #1a73e8; text-decoration: none;">
                  ${record.owner_email}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="label">Phone</div>
              <div class="value">
                <a href="tel:${record.owner_phone}" style="color: #1a73e8; text-decoration: none;">
                  ${record.owner_phone}
                </a>
              </div>
            </div>

            <hr class="divider" />

            ${imageHtml}

            <div class="field">
              <div class="label">Status</div>
              <div class="value">
                <span class="status-badge">${record.status}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            Luxury Properties Ltd &bull; Property Submission Notification
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Brevo (Sendinblue) API
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Luxury Properties",
          email: "luxurypropertiesltd000@gmail.com",
        },
        to: [
          {
            email: "luxurypropertiesltd000@gmail.com",
            name: "Luxury Properties Admin",
          },
        ],
        subject: `New Property Submission: ${record.title} - ${formattedPrice}`,
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Email sent successfully via Brevo:", responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});