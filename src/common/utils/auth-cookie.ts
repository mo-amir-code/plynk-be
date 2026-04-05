import { Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const setAuthCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: SEVEN_DAYS_IN_MS,
    path: "/",
  });
};
