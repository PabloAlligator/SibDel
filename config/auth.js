import { env } from "./env.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const sessionTtlMs = env.SESSION_TTL_DAYS * DAY_IN_MS;

const sessionCookieOptions = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: sessionTtlMs,
  priority: "high",
});

export const authConfig = Object.freeze({
  sessionCookieName: env.SESSION_COOKIE_NAME,
  sessionTtlMs,
  sessionTouchIntervalMs: 15 * 60 * 1000,
  maxSessionsPerUser: 10,
});

export function getSessionCookieOptions() {
  return {
    ...sessionCookieOptions,
  };
}

export function getClearSessionCookieOptions() {
  const { maxAge, ...options } = sessionCookieOptions;

  return {
    ...options,
  };
}
