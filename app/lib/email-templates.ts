// Professional email templates for notifications

export interface EmailTemplateData {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  customerName: string;
  customerEmail: string;
  bookingReference?: string;
  startDate?: string;
  endDate?: string;
  items?: string[];
  amountDue?: string;
  currency?: string;
  optOutUrl?: string;
}

/**
 * Base email template with professional styling
 */
const baseTemplate = (content: string, data: EmailTemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification from ${data.businessName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
      color: #333333;
    }
    .content p {
      margin: 0 0 15px 0;
      font-size: 15px;
    }
    .highlight-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .items-list {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .items-list ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .items-list li {
      margin: 5px 0;
      color: #555;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #6c757d;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.businessName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${data.businessName}</strong></p>
      ${data.businessEmail ? `<p>Email: <a href="mailto:${data.businessEmail}">${data.businessEmail}</a></p>` : ''}
      ${data.businessPhone ? `<p>Phone: ${data.businessPhone}</p>` : ''}
      <div class="divider"></div>
      <p style="font-size: 11px; color: #999;">
        You received this email because you have a booking with ${data.businessName}.
        ${data.optOutUrl ? `<br><a href="${data.optOutUrl}" style="color: #999;">Unsubscribe from notifications</a>` : ''}
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Rental reminder email template
 */
export const rentalReminderTemplate = (data: EmailTemplateData): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>This is a friendly reminder that your rental is scheduled to start on <strong>${data.startDate}</strong>.</p>

    ${data.bookingReference ? `<p>Booking Reference: <strong>${data.bookingReference}</strong></p>` : ''}

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Rental Items:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="highlight-box">
      <p style="margin: 0; font-weight: 600; color: #667eea;">📅 Pickup/Delivery Date: ${data.startDate}</p>
      ${data.endDate ? `<p style="margin: 5px 0 0 0; color: #666;">Return Date: ${data.endDate}</p>` : ''}
    </div>

    <p>Please ensure you're ready for pickup or delivery at the scheduled time. If you need to make any changes, please contact us as soon as possible.</p>

    <p style="margin-top: 25px;">Thank you for your business!</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

This is a friendly reminder that your rental is scheduled to start on ${data.startDate}.

${data.bookingReference ? `Booking Reference: ${data.bookingReference}` : ''}

${data.items && data.items.length > 0 ? `Rental Items:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

Pickup/Delivery Date: ${data.startDate}
${data.endDate ? `Return Date: ${data.endDate}` : ''}

Please ensure you're ready for pickup or delivery at the scheduled time. If you need to make any changes, please contact us as soon as possible.

Thank you for your business!
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Reminder: Your Rental Starts ${data.startDate}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Return reminder email template
 */
export const returnReminderTemplate = (data: EmailTemplateData): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>This is a reminder that your rental is due for return on <strong>${data.endDate}</strong>.</p>

    ${data.bookingReference ? `<p>Booking Reference: <strong>${data.bookingReference}</strong></p>` : ''}

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Items to Return:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="highlight-box">
      <p style="margin: 0; font-weight: 600; color: #dc3545;">⏰ Return Date: ${data.endDate}</p>
      <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Please return all items on time to avoid late fees.</p>
    </div>

    <p>Please ensure all items are returned in good condition. If you need an extension or have any issues, please contact us before the return date.</p>

    <p style="margin-top: 25px;">Thank you for choosing ${data.businessName}!</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

This is a reminder that your rental is due for return on ${data.endDate}.

${data.bookingReference ? `Booking Reference: ${data.bookingReference}` : ''}

${data.items && data.items.length > 0 ? `Items to Return:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

Return Date: ${data.endDate}
Please return all items on time to avoid late fees.

Please ensure all items are returned in good condition. If you need an extension or have any issues, please contact us before the return date.

Thank you for choosing ${data.businessName}!
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Reminder: Rental Return Due ${data.endDate}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Payment reminder email template
 */
export const paymentReminderTemplate = (data: EmailTemplateData): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>This is a friendly reminder about your outstanding payment for booking <strong>${data.bookingReference || 'with us'}</strong>.</p>

    <div class="highlight-box" style="border-left-color: #ffc107;">
      <p style="margin: 0; font-weight: 600; font-size: 18px; color: #856404;">
        💳 Amount Due: ${data.currency}${data.amountDue}
      </p>
    </div>

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Booking Details:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <p>Please make the payment at your earliest convenience. If you have any questions about this payment or need to discuss payment options, please don't hesitate to contact us.</p>

    <p style="margin-top: 25px;">Thank you for your prompt attention to this matter.</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

This is a friendly reminder about your outstanding payment for booking ${data.bookingReference || 'with us'}.

Amount Due: ${data.currency}${data.amountDue}

${data.items && data.items.length > 0 ? `Booking Details:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

Please make the payment at your earliest convenience. If you have any questions about this payment or need to discuss payment options, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Payment Reminder - ${data.currency}${data.amountDue} Due`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Booking confirmation email template
 */
export const bookingConfirmationTemplate = (data: EmailTemplateData): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>Great news! Your booking has been confirmed. 🎉</p>

    ${data.bookingReference ? `
      <div class="highlight-box" style="border-left-color: #28a745;">
        <p style="margin: 0; font-weight: 600; color: #28a745;">
          ✓ Booking Reference: ${data.bookingReference}
        </p>
      </div>
    ` : ''}

    <p><strong>Rental Period:</strong></p>
    <ul style="margin: 5px 0 15px 0; padding-left: 20px;">
      <li>Start: ${data.startDate}</li>
      <li>End: ${data.endDate}</li>
    </ul>

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Confirmed Items:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    ${data.amountDue ? `
      <p><strong>Total Amount:</strong> ${data.currency}${data.amountDue}</p>
    ` : ''}

    <p>We'll send you a reminder before your rental starts. If you have any questions or need to make changes, please contact us.</p>

    <p style="margin-top: 25px;">We look forward to serving you!</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

Great news! Your booking has been confirmed.

${data.bookingReference ? `Booking Reference: ${data.bookingReference}` : ''}

Rental Period:
- Start: ${data.startDate}
- End: ${data.endDate}

${data.items && data.items.length > 0 ? `Confirmed Items:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

${data.amountDue ? `Total Amount: ${data.currency}${data.amountDue}` : ''}

We'll send you a reminder before your rental starts. If you have any questions or need to make changes, please contact us.

We look forward to serving you!
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Booking Confirmed - ${data.bookingReference || 'Your Rental'}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * New inquiry notification for business owner
 */
export const newInquiryTemplate = (data: EmailTemplateData & { inquiryMessage?: string }): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi there,</p>

    <p>You have received a new inquiry from <strong>${data.customerName}</strong>.</p>

    <div class="highlight-box">
      <p style="margin: 0 0 5px 0;"><strong>Customer Details:</strong></p>
      <p style="margin: 3px 0;">Name: ${data.customerName}</p>
      <p style="margin: 3px 0;">Email: ${data.customerEmail}</p>
      ${data.startDate && data.endDate ? `
        <p style="margin: 3px 0;">Rental Period: ${data.startDate} to ${data.endDate}</p>
      ` : ''}
    </div>

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Items Requested:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    ${data.inquiryMessage ? `
      <p><strong>Message:</strong></p>
      <div class="highlight-box">
        <p style="margin: 0;">${data.inquiryMessage}</p>
      </div>
    ` : ''}

    <p>Please respond to this inquiry as soon as possible to provide the best customer service.</p>
  `;

  const text = `
New Inquiry Received

You have received a new inquiry from ${data.customerName}.

Customer Details:
- Name: ${data.customerName}
- Email: ${data.customerEmail}
${data.startDate && data.endDate ? `- Rental Period: ${data.startDate} to ${data.endDate}` : ''}

${data.items && data.items.length > 0 ? `Items Requested:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

${data.inquiryMessage ? `Message:\n${data.inquiryMessage}\n` : ''}

Please respond to this inquiry as soon as possible to provide the best customer service.
  `.trim();

  return {
    subject: `New Inquiry from ${data.customerName}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Rental request approval email template (customer notification)
 */
export const rentalRequestApprovalTemplate = (data: EmailTemplateData & { paymentLinkUrl?: string }): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>Great news! Your rental request has been <strong style="color: #28a745;">approved</strong>. 🎉</p>

    ${data.bookingReference ? `
      <div class="highlight-box" style="border-left-color: #28a745;">
        <p style="margin: 0; font-weight: 600; color: #28a745;">
          ✓ Request Reference: ${data.bookingReference}
        </p>
      </div>
    ` : ''}

    <p><strong>Rental Period:</strong></p>
    <ul style="margin: 5px 0 15px 0; padding-left: 20px;">
      <li>Start: ${data.startDate}</li>
      <li>End: ${data.endDate}</li>
    </ul>

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Approved Items:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    ${data.amountDue ? `
      <div class="highlight-box" style="border-left-color: #007bff;">
        <p style="margin: 0; font-weight: 600; font-size: 18px; color: #007bff;">
          💳 Total Amount: ${data.currency}${data.amountDue}
        </p>
      </div>
    ` : ''}

    ${data.paymentLinkUrl ? `
      <p style="text-align: center; margin: 25px 0;">
        <a href="${data.paymentLinkUrl}" class="button">Complete Payment</a>
      </p>
    ` : ''}

    <p>${data.businessName} will contact you shortly to finalize the details. If you have any questions, please don't hesitate to reach out.</p>

    <p style="margin-top: 25px;">We look forward to serving you!</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

Great news! Your rental request has been approved.

${data.bookingReference ? `Request Reference: ${data.bookingReference}` : ''}

Rental Period:
- Start: ${data.startDate}
- End: ${data.endDate}

${data.items && data.items.length > 0 ? `Approved Items:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

${data.amountDue ? `Total Amount: ${data.currency}${data.amountDue}` : ''}

${data.paymentLinkUrl ? `Complete your payment here: ${data.paymentLinkUrl}\n` : ''}

${data.businessName} will contact you shortly to finalize the details. If you have any questions, please don't hesitate to reach out.

We look forward to serving you!
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Request Approved - ${data.bookingReference || 'Your Rental Request'}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Rental request denial email template (customer notification)
 */
export const rentalRequestDenialTemplate = (data: EmailTemplateData & { denialReason?: string }): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>Thank you for your interest in renting with ${data.businessName}. Unfortunately, we are unable to fulfill your rental request at this time.</p>

    ${data.bookingReference ? `
      <div class="highlight-box" style="border-left-color: #dc3545;">
        <p style="margin: 0; font-weight: 600;">Request Reference: ${data.bookingReference}</p>
      </div>
    ` : ''}

    <p><strong>Requested Rental Period:</strong></p>
    <ul style="margin: 5px 0 15px 0; padding-left: 20px;">
      <li>Start: ${data.startDate}</li>
      <li>End: ${data.endDate}</li>
    </ul>

    ${data.denialReason ? `
      <div class="highlight-box" style="border-left-color: #ffc107; background-color: #fff3cd;">
        <p style="margin: 0; font-weight: 600; color: #856404;">Reason:</p>
        <p style="margin: 5px 0 0 0; color: #856404;">${data.denialReason}</p>
      </div>
    ` : ''}

    <p>If you have any questions or would like to discuss alternative options, please feel free to contact us. We appreciate your understanding and hope to serve you in the future.</p>

    <p style="margin-top: 25px;">Thank you for considering ${data.businessName}.</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

Thank you for your interest in renting with ${data.businessName}. Unfortunately, we are unable to fulfill your rental request at this time.

${data.bookingReference ? `Request Reference: ${data.bookingReference}` : ''}

Requested Rental Period:
- Start: ${data.startDate}
- End: ${data.endDate}

${data.denialReason ? `Reason:\n${data.denialReason}\n` : ''}

If you have any questions or would like to discuss alternative options, please feel free to contact us. We appreciate your understanding and hope to serve you in the future.

Thank you for considering ${data.businessName}.
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Rental Request Update - ${data.businessName}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Payment confirmed email template (customer notification)
 */
export const paymentConfirmedTemplate = (data: EmailTemplateData): { subject: string; html: string; text: string } => {
  const content = `
    <p>Hi ${data.customerName},</p>

    <p>Thank you! We have received your payment and your booking is now <strong style="color: #28a745;">fully confirmed</strong>. 🎉</p>

    ${data.bookingReference ? `
      <div class="highlight-box" style="border-left-color: #28a745;">
        <p style="margin: 0; font-weight: 600; color: #28a745;">
          ✓ Booking Reference: ${data.bookingReference}
        </p>
      </div>
    ` : ''}

    ${data.amountDue ? `
      <div class="highlight-box" style="border-left-color: #28a745; background-color: #d4edda;">
        <p style="margin: 0; font-weight: 600; font-size: 18px; color: #155724;">
          ✓ Payment Confirmed: ${data.currency}${data.amountDue}
        </p>
      </div>
    ` : ''}

    <p><strong>Rental Period:</strong></p>
    <ul style="margin: 5px 0 15px 0; padding-left: 20px;">
      <li>Start: ${data.startDate}</li>
      <li>End: ${data.endDate}</li>
    </ul>

    ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Confirmed Items:</p>
        <ul>
          ${data.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <p>We'll send you a reminder before your rental starts. If you have any questions or need to make changes, please contact us.</p>

    <p style="margin-top: 25px;">We look forward to serving you!</p>
    <p style="margin: 5px 0; color: #666;">— The ${data.businessName} Team</p>
  `;

  const text = `
Hi ${data.customerName},

Thank you! We have received your payment and your booking is now fully confirmed.

${data.bookingReference ? `Booking Reference: ${data.bookingReference}` : ''}

${data.amountDue ? `Payment Confirmed: ${data.currency}${data.amountDue}` : ''}

Rental Period:
- Start: ${data.startDate}
- End: ${data.endDate}

${data.items && data.items.length > 0 ? `Confirmed Items:\n${data.items.map(item => `- ${item}`).join('\n')}\n` : ''}

We'll send you a reminder before your rental starts. If you have any questions or need to make changes, please contact us.

We look forward to serving you!
— The ${data.businessName} Team

${data.businessEmail ? `Email: ${data.businessEmail}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
  `.trim();

  return {
    subject: `Payment Confirmed - ${data.bookingReference || 'Your Booking'}`,
    html: baseTemplate(content, data),
    text,
  };
};

/**
 * Team invitation email template
 */
export const teamInvitationTemplate = (data: EmailTemplateData & { invitationUrl: string; role: string; inviterName: string }): { subject: string; html: string; text: string } => {
  const roleDescriptions = {
    admin: 'Full access to all features and settings',
    manager: 'Manage bookings, items, customers, and view reports',
    staff: 'Manage bookings and customers',
    viewer: 'View dashboard and reports only',
  };

  const roleDescription = roleDescriptions[data.role as keyof typeof roleDescriptions] || 'Team member access';

  const content = `
    <p>Hi there,</p>

    <p><strong>${data.inviterName}</strong> has invited you to join their team at <strong>${data.businessName}</strong>!</p>

    <div class="highlight-box" style="border-left-color: #667eea;">
      <p style="margin: 0 0 5px 0; font-weight: 600; color: #667eea;">Your Role: ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</p>
      <p style="margin: 0; color: #666; font-size: 14px;">${roleDescription}</p>
    </div>

    <p>As a team member, you'll be able to help manage the business and collaborate with the team.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
    </p>

    <p style="font-size: 13px; color: #666;">
      This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
    </p>

    <p style="margin-top: 25px; font-size: 13px; color: #999;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.invitationUrl}" style="color: #667eea; word-break: break-all;">${data.invitationUrl}</a>
    </p>
  `;

  const text = `
Team Invitation

${data.inviterName} has invited you to join their team at ${data.businessName}!

Your Role: ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}
${roleDescription}

As a team member, you'll be able to help manage the business and collaborate with the team.

Accept the invitation by visiting:
${data.invitationUrl}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  return {
    subject: `You've been invited to join ${data.businessName}`,
    html: baseTemplate(content, data),
    text,
  };
};
