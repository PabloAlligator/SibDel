import { mailTransporter } from "../config/mail.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const mailFrom = {
  name: env.APP_NAME,
  address: env.SMTP_USER,
};

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateMessageContent({ subject, text, html }) {
  if (typeof subject !== "string" || subject.trim().length === 0) {
    throw new TypeError("Email subject is required.");
  }

  if (!text && !html) {
    throw new TypeError("Email text or HTML content is required.");
  }
}

async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}) {
  const recipient = normalizeEmail(to);

  if (!recipient) {
    throw new TypeError("Email recipient is required.");
  }

  validateMessageContent({
    subject,
    text,
    html,
  });

  const message = {
    from: mailFrom,
    to: recipient,
    subject: subject.trim(),
  };

  if (text) {
    message.text = text;
  }

  if (html) {
    message.html = html;
  }

  const normalizedReplyTo = normalizeEmail(replyTo);

  if (normalizedReplyTo) {
    message.replyTo = normalizedReplyTo;
  }

  try {
    const info = await mailTransporter.sendMail(message);

    logger.info(
      {
        messageId: info.messageId,
        recipient,
      },
      "Email notification sent",
    );

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    logger.error(
      {
        err: error,
        recipient,
      },
      "Email notification sending failed",
    );

    throw error;
  }
}

export async function sendAdminNotification({
  subject,
  text,
  html,
  replyTo,
}) {
  return sendMail({
    to: env.TO_EMAIL,
    subject,
    text,
    html,
    replyTo,
  });
}

export async function sendCustomerNotification({
  to,
  subject,
  text,
  html,
}) {
  return sendMail({
    to,
    subject,
    text,
    html,
  });
}
