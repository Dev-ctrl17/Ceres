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
const FORMSPREE_ENDPOINT_2 = import.meta.env.VITE_FORMSPREE_FORM_ID_2
  ? `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_FORM_ID_2}`
  : null;

// IMPORTANT: FormSubmit has two different endpoints:
//   https://formsubmit.co/{email or alias}        -> plain HTML <form> endpoint (redirects, not JSON-friendly)
//   https://formsubmit.co/ajax/{email or alias}    -> AJAX/fetch endpoint (returns JSON, CORS-friendly)
// We're sending via fetch() with JSON, so we MUST use the /ajax/ variant,
// otherwise the request can fail or return a non-JSON response silently.
//
// FormSubmit also issues an obfuscated activated-form alias (e.g. "el/lemanu")
// once you've confirmed a destination email. If you have one of these, set it
// as VITE_FORMSUBMIT_ALIAS and it takes priority over VITE_FORMSUBMIT_EMAIL,
// since the alias is guaranteed to point at an already-activated form.
const FORMSUBMIT_TARGET = import.meta.env.VITE_FORMSUBMIT_ALIAS || import.meta.env.VITE_FORMSUBMIT_EMAIL;
const FORMSUBMIT_ENDPOINT = FORMSUBMIT_TARGET
  ? `https://formsubmit.co/ajax/${FORMSUBMIT_TARGET}`
  : null;

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

    // Send to primary Formspree form
    const response1 = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result1 = await response1.json();

    if (!response1.ok) {
      console.error('Formspree primary endpoint failed:', response1.status, result1);
    }

    // Send to secondary Formspree form (if configured)
    let response2 = null;
    let result2 = null;
    if (FORMSPREE_ENDPOINT_2) {
      try {
        response2 = await fetch(FORMSPREE_ENDPOINT_2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(data),
        });
        result2 = await response2.json();
        if (!response2.ok) {
          console.error('Formspree secondary endpoint failed:', response2.status, result2);
        }
      } catch (secondaryError) {
        console.warn('Secondary Formspree notification failed:', secondaryError);
      }
    }

    // Send to Formsubmit (if configured) - for second Gmail recipient
    let response3 = null;
    let result3 = null;
    if (FORMSUBMIT_ENDPOINT) {
      try {
        response3 = await fetch(FORMSUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(data),
        });
        result3 = await response3.json();
        if (!response3.ok) {
          console.error('Formsubmit endpoint failed:', response3.status, result3);
        } else {
          console.log('Formsubmit response:', result3);
        }
      } catch (formsubmitError) {
        console.warn('Formsubmit notification failed:', formsubmitError);
      }
    }

    // NOTE: success checks use the fetch Response's `.ok` (HTTP status),
    // not `.ok` on the parsed JSON body, since providers don't necessarily
    // return an `ok` field in their JSON payload.
    const primarySuccess = response1.ok;
    const secondarySuccess = !response2 || response2.ok;
    const formsubmitSuccess = !response3 || response3.ok;

    if (primarySuccess && secondarySuccess && formsubmitSuccess) {
      console.log('Notifications sent to all recipients (Formspree + Formsubmit)');
      return { success: true };
    } else if (primarySuccess) {
      console.log('Primary Formspree notification sent, secondary/Formsubmit may have failed');
      return { success: true };
    } else {
      console.error('Formspree error:', result1);
      return { success: false, error: result1?.error || 'Failed to send notification' };
    }
  } catch (error) {
    console.error('Formspree request failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}
