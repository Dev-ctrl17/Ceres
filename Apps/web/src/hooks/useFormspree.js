// ============================================================
// FORMSPREE REACT HOOK
// ============================================================
// Uses @formspree/react to send email notifications.
// This is the React-idiomatic way to integrate Formspree.
//
// Setup:
// 1. Go to https://formspree.io
// 2. Create a free account
// 3. Create a new form + get its endpoint URL
// 4. Configure the "Send to" email in Formspree dashboard
// 5. The form ID is extracted from the endpoint URL
//    e.g. https://formspree.io/f/xwvgegde -> xwvgegde
// ============================================================

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_FORM_ID || 'xwvgegde'}`;

/**
 * Send a notification to Formspree with the given data via fetch.
 * This is used as a fire-and-forget notification after Supabase saves.
 * Since the Supabase DB save is the primary data store, we use a simple
 * fetch-based approach which is more reliable than trying to read
 * React state synchronously after handleSubmit.
 *
 * @param {Object} data - Key-value pairs to send as form fields
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendFormspreeNotification(data) {
  try {
    if (!FORMSPREE_ENDPOINT) {
      console.warn('VITE_FORMSPREE_FORM_ID not configured. Skipping email notification.');
      return { success: false, error: 'Formspree not configured' };
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Formspree notification sent:', result);
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
