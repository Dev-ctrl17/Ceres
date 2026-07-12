// ============================================================
// FORMSPREE EMAIL NOTIFICATION SERVICE
// ============================================================
// Formspree is a simple form-to-email service.
// No API keys needed on the client side.
//
// Setup:
// 1. Go to https://formspree.io
// 2. Create a free account
// 3. Create a new form + get its endpoint URL
// 4. Configure the "Send to" email in Formspree dashboard
// 5. Set VITE_FORMSPREE_ENDPOINT in your .env file
//
// Each form can have its own endpoint for better organization.
// But for simplicity, you can use one endpoint and include
// the form type in the data sent.
// ============================================================

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xwvgegde';
const FORMSPREE_PROPERTY_ENDPOINT = import.meta.env.VITE_FORMSPREE_PROPERTY_ENDPOINT || FORMSPREE_ENDPOINT;

/**
 * Send email notification via Formspree for lead submissions
 * @param {Object} data - Lead form data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendLeadNotification(data) {
  try {
    if (!FORMSPREE_ENDPOINT) {
      console.warn('VITE_FORMSPREE_ENDPOINT not configured. Skipping email notification.');
      return { success: false, error: 'Formspree not configured' };
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Lead: ${data.name || 'Unknown'} - ${data.leadType || 'Contact'}`,
        name: data.name || 'N/A',
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        leadType: data.leadType || 'Contact Form',
        message: data.message || 'No message provided',
        propertyInterest: data.propertyInterest || 'None',
        submitted_at: new Date().toLocaleString('en-NG', {
          timeZone: 'Africa/Lagos',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Formspree lead notification sent:', result);
      return { success: true };
    } else {
      console.error('Formspree error:', result);
      return { success: false, error: result.error || 'Failed to send notification' };
    }
  } catch (error) {
    console.error('Formspree request failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Send email notification via Formspree for property submissions
 * @param {Object} data - Property submission data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPropertyNotification(data) {
  try {
    const endpoint = FORMSPREE_PROPERTY_ENDPOINT;
    
    if (!endpoint) {
      console.warn('Formspree endpoint not configured. Skipping email notification.');
      return { success: false, error: 'Formspree not configured' };
    }

    const formattedPrice = `₦${Number(data.price).toLocaleString()}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Property: ${data.title || 'Unknown'} - ${formattedPrice}`,
        title: data.title || 'N/A',
        price: formattedPrice,
        location: data.location || 'N/A',
        property_type: data.property_type || 'N/A',
        description: data.description || 'No description',
        owner_name: data.owner_name || 'N/A',
        owner_email: data.owner_email || 'N/A',
        owner_phone: data.owner_phone || 'N/A',
        image_url: data.image_url || '',
        status: data.status || 'Pending',
        submitted_at: new Date().toLocaleString('en-NG', {
          timeZone: 'Africa/Lagos',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Formspree property notification sent:', result);
      return { success: true };
    } else {
      console.error('Formspree error:', result);
      return { success: false, error: result.error || 'Failed to send notification' };
    }
  } catch (error) {
    console.error('Formspree request failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}