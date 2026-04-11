import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    code: 429,
    message: "Too many attempts. Please try again later.",
    result: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    code: 429,
    message: "Too many password reset requests. Please try again later.",
    result: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    code: 429,
    message: "Too many reset attempts. Please try again later.",
    result: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const syncLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    code: 429,
    message: "You are syncing too fast. Please slow down and try again later.",
    result: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    code: 429,
    message: "Too many contact requests. Please try again later.",
    result: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
