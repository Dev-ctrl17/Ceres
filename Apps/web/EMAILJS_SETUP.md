# EmailJS Setup Guide - Form Notifications

## Overview
All form submissions will be sent directly to `info@luxurypropertiesltd.com.ng` using EmailJS (no Brevo required).

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email

## Step 2: Add Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Name your service (e.g., "Luxury Properties")
6. Note down your **Service ID**

## Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Design your email template or use the one below
4. Note down your **Template ID**

### Template for Lead Submissions (Contact/EPAN Forms):

**Subject:** `New Lead: {{name}} - {{leadType}}`

**Content:**
```
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #333; }
    .value { color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📩 New Lead Submission</h2>
    <div class="field">
      <div class="label">Name:</div>
      <div class="value">{{name}}</div>
    </div>
    <div class="field">
      <div class="label">Email:</div>
      <div class="value">{{email}}</div>
    </div>
    <div class="field">
      <div class="label">Phone:</div>
      <div class="value">{{phone}}</div>
    </div>
    <div class="field">
      <div class="label">Lead Type:</div>
      <div class="value">{{leadType}}</div>
    </div>
    {{#if message}}
    <div class="field">
      <div class="label">Message:</div>
      <div class="value">{{message}}</div>
    </div>
    {{/if}}
    <div class="field">
      <div class="label">Submitted At:</div>
      <div class="value">{{submitted_at}}</div>
    </div>
  </div>
</body>
</html>
```

### Template for Property Submissions:

**Subject:** `New Property Submission: {{title}} - {{price}}`

**Content:**
```
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #333; }
    .value { color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🏠 New Property Submission</h2>
    <div class="field">
      <div class="label">Title:</div>
      <div class="value">{{title}}</div>
    </div>
    <div class="field">
      <div class="label">Price:</div>
      <div class="value">{{price}}</div>
    </div>
    <div class="field">
      <div class="label">Location:</div>
      <div class="value">{{location}}</div>
    </div>
    <div class="field">
      <div class="label">Property Type:</div>
      <div class="value">{{property_type}}</div>
    </div>
    <div class="field">
      <div class="label">Owner Name:</div>
      <div class="value">{{owner_name}}</div>
    </div>
    <div class="field">
      <div class="label">Owner Email:</div>
      <div class="value">{{owner_email}}</div>
    </div>
    <div class="field">
      <div class="label">Owner Phone:</div>
      <div class="value">{{owner_phone}}</div>
    </div>
    <div class="field">
      <div class="label">Status:</div>
      <div class="value">{{status}}</div>
    </div>
  </div>
</body>
</html>
```

## Step 4: Get Your Keys

From EmailJS Dashboard, collect:
1. **Service ID** (e.g., `service_xxxxxxx`)
2. **Template ID** (e.g., `template_xxxxxxx`)
3. **Public Key** (found in Settings → API Keys)

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_NOTIFICATION_EMAIL=info@luxurypropertiesltd.com.ng
```

## Step 6: Install EmailJS

```bash
npm install @emailjs/browser
```

## Step 7: Update Forms

The forms will be updated to use EmailJS for sending notifications directly to `info@luxurypropertiesltd.com.ng`.

## Benefits of EmailJS:

✅ No backend required - sends directly from client
✅ Free tier: 200 emails/month
✅ No Brevo API needed
✅ Simple setup
✅ Reliable delivery

## Cost:

- **Free:** 200 emails/month
- **Personal:** $7/month for 1,000 emails
- **Professional:** $20/month for 10,000 emails

Perfect for your use case!