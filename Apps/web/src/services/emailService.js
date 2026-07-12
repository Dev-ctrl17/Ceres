import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  toEmail: import.meta.env.VITE_NOTIFICATION_EMAIL || 'info@luxurypropertiesltd.com.ng',
};

/**
 * Send email notification for lead submissions (Contact Form, EPAN forms)
 * @param {Object} leadData - Lead form data
 * @param {string} leadData.name - Submitter's name
 * @param {string} leadData.email - Submitter's email
 * @param {string} leadData.phone - Submitter's phone
 * @param {string} leadData.leadType - Type of lead
 * @param {string} [leadData.message] - Optional message
 * @param {string} [leadData.propertyInterest] - Optional property interest
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendLeadNotification(leadData) {
  try {
    const templateParams = {
      name: leadData.name || 'N/A',
      email: leadData.email || 'N/A',
      phone: leadData.phone || 'N/A',
      leadType: leadData.leadType || 'Contact Form',
      message: leadData.message || '',
      propertyInterest: leadData.propertyInterest || 'None',
      submitted_at: new Date().toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Lead notification email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Failed to send lead notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email notification' 
    };
  }
}

/**
 * Send email notification for property submissions
 * @param {Object} propertyData - Property submission data
 * @param {string} propertyData.title - Property title
 * @param {number} propertyData.price - Property price
 * @param {string} propertyData.location - Property location
 * @param {string} propertyData.property_type - Property type
 * @param {string} propertyData.owner_name - Owner's name
 * @param {string} propertyData.owner_email - Owner's email
 * @param {string} propertyData.owner_phone - Owner's phone
 * @param {string} [propertyData.description] - Property description
 * @param {string} [propertyData.image_url] - Property image URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPropertyNotification(propertyData) {
  try {
    const formattedPrice = `₦${Number(propertyData.price).toLocaleString()}`;
    
    const templateParams = {
      title: propertyData.title || 'N/A',
      price: formattedPrice,
      location: propertyData.location || 'N/A',
      property_type: propertyData.property_type || 'N/A',
      description: propertyData.description || 'No description provided',
      owner_name: propertyData.owner_name || 'N/A',
      owner_email: propertyData.owner_email || 'N/A',
      owner_phone: propertyData.owner_phone || 'N/A',
      image_url: propertyData.image_url || '',
      status: propertyData.status || 'Pending',
      submitted_at: new Date().toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Property notification email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Failed to send property notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email notification' 
    };
  }
}

/**
 * Send general notification email
 * @param {Object} data - Email data
 * @param {string} data.subject - Email subject
 * @param {string} data.html - Email HTML content
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendGeneralNotification(data) {
  try {
    const templateParams = {
      subject: data.subject || 'New Notification',
      html: data.html || '',
      submitted_at: new Date().toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Notification email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email notification' 
    };
  }
}

export default {
  sendLeadNotification,
  sendPropertyNotification,
  sendGeneralNotification,
};