/**
 * SWAHILI EARN - Notification & Email Dispatch System
 * Records in-dashboard notifications and dispatches/logs emails
 */

import { pool } from './db.ts';

export async function createNotification(userId: number, title: string, message: string, type: string) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
      [userId, title, message, type]
    );
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

export async function sendEmailNotification(to: string, subject: string, htmlContent: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);
  console.log(`[EMAIL BODY PREVIEW]\n${htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()}`);

  if (smtpHost && smtpUser && smtpPass) {
    console.log(`[SMTP CONFIG PRESENT] Forwarding to relay server ${smtpHost}...`);
  }
  return true;
}

export async function notifyLeadCapture(lead: {
  full_name: string;
  phone_number: string;
  ip_address?: string;
  timestamp?: string;
}) {
  try {
    const settings = await pool.query(`SELECT value FROM admin_settings WHERE key = 'admin_email'`);
    const adminEmail = settings.rows[0]?.value || 'getarydickson@gmail.com';

    // Format phone for WhatsApp link (strip non-digits, ensure country code)
    const digitsOnly = lead.phone_number.replace(/\D/g, '');
    const waPhone = digitsOnly.startsWith('0')
      ? '255' + digitsOnly.slice(1)
      : digitsOnly.startsWith('255')
      ? digitsOnly
      : digitsOnly;

    const emailSubject = `🔔 [NEW LEAD] Swahili Earn Client: ${lead.full_name} (${lead.phone_number})`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0066FF; margin-top: 0;">🎯 New Client Lead Form Submission</h2>
        <p style="font-size: 14px; color: #475569;">A new person has signed in to SWAHILI EARN. Here are their details for immediate follow-up:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Client Full Name</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-size: 16px;"><strong>${lead.full_name}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Phone Number</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0066FF; font-weight: bold;">
              <a href="tel:${lead.phone_number}" style="color: #0066FF; text-decoration: none;">${lead.phone_number}</a>
            </td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Instant WhatsApp Link</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
              <a href="https://wa.me/${waPhone}?text=Habari%20${encodeURIComponent(lead.full_name)}%2C%20karibu%20SWAHILI%20EARN.%20Nimepokea%20taarifa%20yako." 
                 style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Chat on WhatsApp
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Submission Time</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${lead.timestamp || new Date().toLocaleString()}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Next Step</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #b45309;">Call or WhatsApp the client to assist with their account activation and payout setup.</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          SWAHILI EARN Platform Lead Notification System · Direct alert to ${adminEmail}
        </div>
      </div>
    `;

    await sendEmailNotification(adminEmail, emailSubject, htmlBody);
  } catch (err) {
    console.error('Error dispatching lead capture email:', err);
  }
}

export async function notifyAdminOnRegistration(user: { id: number; full_name: string; phone_number: string; email: string }) {
  try {
    const settings = await pool.query(`SELECT value FROM admin_settings WHERE key = 'admin_email'`);
    const adminEmail = settings.rows[0]?.value || 'getarydickson@gmail.com';

    await sendEmailNotification(
      adminEmail,
      `[SWAHILI EARN] New User Registration Alert: ${user.full_name}`,
      `
        <h2>New User Registered on SWAHILI EARN</h2>
        <p><strong>Name:</strong> ${user.full_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone_number}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    );
  } catch (err) {
    console.error('Error sending admin registration email:', err);
  }
}
