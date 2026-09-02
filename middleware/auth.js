import {
  authConfig,
  getClearSessionCookieOptions,
} from "../config/auth.js";

import {
  resolveSessionToken,
} from "../services/auth.service.js";

function createUnauthorizedError() {
  const error = new Error(
    "Необходимо войти в аккаунт.",
  );

  error.statusCode = 401;
  error.code = "UNAUTHORIZED";
  error.expose = true;

  return error;
}

export async function authMiddleware(
  req,
  res,
  next,
) {
  req.auth = null;
  req.user = null;

  const token =
    req.cookies?.[
      authConfig.sessionCookieName
    ];

  if (!token) {
    return next();
  }

  try {
    const auth =
      await resolveSessionToken(token);

    if (!auth) {
      res.clearCookie(
        authConfig.sessionCookieName,
        getClearSessionCookieOptions(),
      );

      return next();
    }

    req.auth = auth;
    req.user = auth.user;

    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAuth(
  req,
  _res,
  next,
) {
  if (!req.auth?.user) {
    return next(
      createUnauthorizedError(),
    );
  }

  return next();
}
