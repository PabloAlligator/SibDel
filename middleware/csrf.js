import { env } from "../config/env.js";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const allowedOrigins = new Set([
  new URL(env.APP_URL).origin,
]);

if (env.NODE_ENV === "development") {
  allowedOrigins.add(
    `http://localhost:${env.PORT}`,
  );

  allowedOrigins.add(
    `http://127.0.0.1:${env.PORT}`,
  );
}

function normalizeOrigin(value) {
  if (
    typeof value !== "string" ||
    !value
  ) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function createCsrfError() {
  const error = new Error(
    "Запрос заблокирован системой защиты.",
  );

  error.statusCode = 403;
  error.code = "CSRF_PROTECTION";
  error.expose = true;

  return error;
}

export function csrfProtection(
  req,
  _res,
  next,
) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const fetchSite =
    req.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return next(createCsrfError());
  }

  const originHeader =
    req.get("origin");

  if (originHeader) {
    const origin =
      normalizeOrigin(originHeader);

    if (
      !origin ||
      !allowedOrigins.has(origin)
    ) {
      return next(createCsrfError());
    }

    return next();
  }

  const refererHeader =
    req.get("referer");

  if (refererHeader) {
    const refererOrigin =
      normalizeOrigin(refererHeader);

    if (
      !refererOrigin ||
      !allowedOrigins.has(
        refererOrigin,
      )
    ) {
      return next(createCsrfError());
    }

    return next();
  }

  if (fetchSite === "same-origin") {
    return next();
  }

  return next(createCsrfError());
}
