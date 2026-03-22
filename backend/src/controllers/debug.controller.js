import { env } from '../config/env.js';
import { emailService } from '../services/email.service.js';
import { AppError } from '../utils/AppError.js';

const OTP_EXPIRY_MINUTES = Math.max(env.otpExpiryMinutes, 1);
const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const assertDebugEndpointEnabled = () => {
  if (env.nodeEnv === 'production') {
    throw new AppError('Debug email routes are disabled in production', 404);
  }
};

export const getSmtpDebugStatus = async (req, res) => {
  assertDebugEndpointEnabled();

  return res.json({
    message: 'SMTP status fetched successfully',
    smtp: emailService.getDebugStatus(),
  });
};

export const sendDebugOtpEmail = async (req, res) => {
  assertDebugEndpointEnabled();

  const { email } = req.validatedBody;
  const otp = makeOtp();

  await emailService.sendOtp({
    email,
    otp,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });

  return res.json({
    message: 'OTP email sent successfully',
    email,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    developmentOtp: env.devOtpExposeInApi ? otp : undefined,
  });
};
