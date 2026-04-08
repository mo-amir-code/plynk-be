import { Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getAuthCookieOptions(),
    maxAge: SEVEN_DAYS_IN_MS,
  });

};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
};
