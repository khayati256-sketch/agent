import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const canSendEmail = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
const forceMockEmail = env.devOtpMode && !canSendEmail;
const isGmailSmtp = /^smtp\.gmail\.com$/i.test(env.smtpHost);
const EMAIL_TIMEOUT_MS = 20 * 1000;

const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      requireTLS: !env.smtpSecure,
      connectionTimeout: EMAIL_TIMEOUT_MS,
      greetingTimeout: EMAIL_TIMEOUT_MS,
      socketTimeout: EMAIL_TIMEOUT_MS,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      tls: {
        minVersion: 'TLSv1.2',
      },
    })
  : null;

const maskValue = (value) => {
  if (!value) {
    return '<empty>';
  }

  if (value.length <= 4) {
    return '****';
  }

  return `${value.slice(0, 2)}${'*'.repeat(Math.max(value.length - 4, 1))}${value.slice(-2)}`;
};

const getMissingSmtpKeys = () =>
  [
    ['SMTP_HOST', env.smtpHost],
    ['SMTP_USER', env.smtpUser],
    ['SMTP_PASS', env.smtpPass],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

const getDebugStatus = () => ({
  smtpConfigured: canSendEmail,
  usingMockMode: forceMockEmail || !transporter,
  host: env.smtpHost || '<missing>',
  port: env.smtpPort,
  secure: env.smtpSecure,
  user: maskValue(env.smtpUser),
  passConfigured: Boolean(env.smtpPass),
  passLooksLikeGmailAppPassword: isGmailSmtp ? env.smtpPass.length === 16 : undefined,
  mailFrom: env.mailFrom,
  devOtpMode: env.devOtpMode,
  nodeEnv: env.nodeEnv,
});

const logSmtpConfiguration = () => {
  const status = getDebugStatus();
  console.log('[Email Service] SMTP runtime configuration:', status);

  if (!canSendEmail) {
    console.warn(
      `[Email Service] SMTP is incomplete. Missing env keys: ${getMissingSmtpKeys().join(', ') || 'none'}`,
    );
    return;
  }

  if (isGmailSmtp && env.smtpPass.length !== 16) {
    console.warn(
      '[Email Service] SMTP_PASS does not look like a Gmail App Password. Use a 16-character app password (no spaces).',
    );
  }

  if (isGmailSmtp && env.smtpPort !== 587 && env.smtpPort !== 465) {
    console.warn('[Email Service] Gmail SMTP usually works with port 587 (STARTTLS) or 465 (SSL).');
  }

  if (isGmailSmtp && env.mailFrom.toLowerCase() !== env.smtpUser.toLowerCase()) {
    console.warn(
      '[Email Service] MAIL_FROM differs from SMTP_USER. For Gmail, matching addresses improves deliverability.',
    );
  }
};

logSmtpConfiguration();

let transportVerifyPromise = null;

const verifyTransporter = async () => {
  if (!transporter) {
    return false;
  }

  if (!transportVerifyPromise) {
    transportVerifyPromise = transporter
      .verify()
      .then(() => {
        console.log('[Email Service] SMTP transporter verification successful.');
        return true;
      })
      .catch((error) => {
        transportVerifyPromise = null;
        console.error('[Email Service] SMTP transporter verification failed:', {
          code: error?.code,
          message: error?.message,
          response: error?.response,
        });
        return false;
      });
  }

  return transportVerifyPromise;
};

const sendMailOrLog = async ({ to, subject, html }) => {
  if (forceMockEmail || !transporter) {
    console.log(`[Email Mock] To: ${to}`);
    console.log(`[Email Mock] Subject: ${subject}`);
    console.log(`[Email Mock] Body: ${html}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: env.mailFrom,
      to,
      subject,
      html,
    });

    console.log('[Email Service] Email delivered:', {
      to,
      subject,
      messageId: info?.messageId,
      response: info?.response,
    });
  } catch (error) {
    console.error('[Email Service] Email delivery failed:', {
      to,
      subject,
      code: error?.code,
      command: error?.command,
      response: error?.response,
      message: error?.message,
    });

    if (isGmailSmtp && (error?.code === 'EAUTH' || /invalid login/i.test(error?.message ?? ''))) {
      throw new AppError(
        'SMTP authentication failed. For Gmail, enable 2-Step Verification and use a 16-character App Password in SMTP_PASS.',
        502,
      );
    }

    throw new AppError(`Email delivery failed: ${error?.message ?? 'Unknown SMTP error'}`, 502);
  }
};

export const emailService = {
  verifyConnection: async () => verifyTransporter(),
  getDebugStatus,

  sendOtp: async ({ email, otp, expiresInMinutes = 5 }) => {
    await sendMailOrLog({
      to: email,
      subject: 'Your AI Assistant OTP Code',
      html: `<p>Your OTP code is <b>${otp}</b>.</p><p>This code expires in ${expiresInMinutes} minutes.</p>`,
    });
  },

  sendPasswordReset: async ({ email, resetUrl }) => {
    await sendMailOrLog({
      to: email,
      subject: 'Reset your AI Assistant password',
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });
  },

  sendPasswordResetOtp: async ({ email, otp, expiresInMinutes = 5 }) => {
    await sendMailOrLog({
      to: email,
      subject: 'AI Assistant Password Reset OTP',
      html: `<p>Your password reset OTP is <b>${otp}</b>.</p><p>This OTP expires in ${expiresInMinutes} minutes.</p>`,
    });
  },

  sendEmail: async ({ to, subject, body }) => {
    await sendMailOrLog({
      to,
      subject,
      html: `<p>${body}</p>`,
    });
  },
};
