/**
 * Email Notification System
 *
 * Sends email notifications for wholesale supplier refresh events.
 * Uses Resend for email delivery (configurable).
 */

import { Resend } from "resend";

// Initialize Resend with API key from environment
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";

export interface RefreshNotificationData {
  runId: string;
  trigger: string;
  totalRecordsFound: number;
  totalRecordsNew: number;
  totalRecordsUpdated: number;
  duration: number;
  success: boolean;
  errors: string[];
}

/**
 * Send refresh completion notification
 */
export async function sendRefreshNotification(
  data: RefreshNotificationData
): Promise<void> {
  if (!resend) {
    console.warn(
      "[Email] Resend API key not configured. Skipping email notification."
    );
    return;
  }

  try {
    const subject = data.success
      ? `✅ Wholesale Supplier Refresh Completed - ${data.totalRecordsNew} New`
      : `❌ Wholesale Supplier Refresh Failed`;

    const html = generateRefreshEmail(data);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    console.log(`[Email] Sent refresh notification to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("[Email] Error sending notification:", error);
  }
}

/**
 * Generate HTML email template
 */
function generateRefreshEmail(data: RefreshNotificationData): string {
  const durationMinutes = Math.round(data.duration / 60000);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: ${data.success ? "#10b981" : "#ef4444"};
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .metric {
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        .error {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px;
          margin: 10px 0;
          border-radius: 6px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.success ? "✅ Refresh Completed" : "❌ Refresh Failed"}</h1>
          <p>Wholesale Supplier Discovery System</p>
        </div>

        <div class="content">
          <p><strong>Run ID:</strong> ${data.runId}</p>
          <p><strong>Trigger:</strong> ${data.trigger}</p>
          <p><strong>Duration:</strong> ${durationMinutes} minutes</p>

          <div class="metric">
            <div class="metric-label">Total Records Found</div>
            <div class="metric-value">${data.totalRecordsFound}</div>
          </div>

          <div class="metric">
            <div class="metric-label">New Suppliers</div>
            <div class="metric-value">${data.totalRecordsNew}</div>
          </div>

          <div class="metric">
            <div class="metric-label">Updated Suppliers</div>
            <div class="metric-value">${data.totalRecordsUpdated}</div>
          </div>

          ${
            data.errors.length > 0
              ? `
            <h3>Errors (${data.errors.length})</h3>
            ${data.errors
              .map((error) => `<div class="error">${error}</div>`)
              .join("")}
          `
              : ""
          }

          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/wholesale-suppliers/admin"
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              View Admin Dashboard
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send test email (for verification)
 */
export async function sendTestEmail(): Promise<void> {
  if (!resend) {
    throw new Error("Resend API key not configured");
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: "Test Email - Wholesale Supplier System",
    html: "<p>This is a test email from the Wholesale Supplier Discovery System.</p>",
  });

  console.log(`[Email] Test email sent to ${ADMIN_EMAIL}`);
}
