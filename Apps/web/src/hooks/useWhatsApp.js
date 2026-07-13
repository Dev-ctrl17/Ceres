// ============================================================
// WHATSAPP NOTIFICATION HOOK
// ============================================================
// Sends WhatsApp notifications when forms are submitted.
// Uses a third-party WhatsApp Business API service.
//
// Setup:
// 1. Sign up for a WhatsApp Business API service (e.g., Twilio, Wati, Interakt)
// 2. Get your API credentials
// 3. Add the following to your .env file:
//    VITE_WHATSAPP_API_URL=your_api_url
//    VITE_WHATSAPP_API_KEY=your_api_key
//    VITE_WHATSAPP_PHONE_NUMBER=2349056201176
// ============================================================

const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || '';
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY || '';
const WHATSAPP_PHONE_NUMBER = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER || '2349056201176';

/**
 * Send a WhatsApp notification with the given data
 * @param {Object} data - Form submission data
 * @param {string} data.type - Type of form (property_submission, contact_form, property_enquiry)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendWhatsAppNotification(data) {
  try {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
      console.warn('WhatsApp API not configured. Skipping WhatsApp notification.');
      return { success: false, error: 'WhatsApp not configured' };
    }

    // Format the message based on form type
    let message = '';
    switch (data.type) {
      case 'property_submission':
        message = formatPropertySubmissionMessage(data);
        break;
      case 'contact_form':
        message = formatContactFormMessage(data);
        break;
      case 'property_enquiry':
        message = formatPropertyEnquiryMessage(data);
        break;
      default:
        message = formatGenericMessage(data);
    }

    // Send via WhatsApp API
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        to: WHATSAPP_PHONE_NUMBER,
        message: message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      return { success: false, error: error.message || 'Failed to send WhatsApp' };
    }

    console.log('WhatsApp notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('WhatsApp request failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Format property submission message for WhatsApp
 */
function formatPropertySubmissionMessage(data) {
  return `🏠 *NEW PROPERTY SUBMISSION*\n\n` +
    `*Title:* ${data.title || 'N/A'}\n` +
    `*Price:* ${data.price || 'N/A'}\n` +
    `*Location:* ${data.location || 'N/A'}\n` +
    `*Type:* ${data.property_type || 'N/A'}\n\n` +
    `*Owner Details:*\n` +
    `Name: ${data.owner_name || 'N/A'}\n` +
    `Email: ${data.owner_email || 'N/A'}\n` +
    `Phone: ${data.owner_phone || 'N/A'}\n\n` +
    `*Description:*\n${data.description || 'N/A'}\n\n` +
    `*Submitted:* ${data.submitted_at || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`;
}

/**
 * Format contact form message for WhatsApp
 */
function formatContactFormMessage(data) {
  return `📧 *NEW CONTACT FORM SUBMISSION*\n\n` +
    `*Name:* ${data.name || 'N/A'}\n` +
    `*Email:* ${data.email || 'N/A'}\n` +
    `*Phone:* ${data.phone || 'N/A'}\n\n` +
    `*Message:*\n${data.message || 'N/A'}\n\n` +
    `*Submitted:* ${data.submitted_at || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`;
}

/**
 * Format property enquiry message for WhatsApp
 */
function formatPropertyEnquiryMessage(data) {
  return `🔍 *NEW PROPERTY ENQUIRY*\n\n` +
    `*Property:* ${data.propertyInterest || 'N/A'}\n` +
    `*Name:* ${data.name || 'N/A'}\n` +
    `*Email:* ${data.email || 'N/A'}\n` +
    `*Phone:* ${data.phone || 'N/A'}\n` +
    `*Preferred Date:* ${data.preferred_date || 'N/A'}\n` +
    `*Preferred Time:* ${data.preferred_time || 'N/A'}\n\n` +
    `*Message:*\n${data.message || 'N/A'}\n\n` +
    `*Submitted:* ${data.submitted_at || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`;
}

/**
 * Format generic message for WhatsApp
 */
function formatGenericMessage(data) {
  return `📋 *NEW FORM SUBMISSION*\n\n` +
    Object.entries(data)
      .filter(([key]) => !['type', 'submitted_at'].includes(key))
      .map(([key, value]) => `*${key}:* ${value || 'N/A'}`)
      .join('\n') +
    `\n\n*Submitted:* ${data.submitted_at || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`;
}