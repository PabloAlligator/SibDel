import {
  authConfig,
  getClearSessionCookieOptions,
  getSessionCookieOptions,
} from "../config/auth.js";

import {
  authenticateUserByEmail,
  createSession,
  revokeSessionToken,
} from "../services/auth.service.js";

function createInvalidCredentialsError() {
  const error = new Error(
    "Неверный email или пароль.",
  );

  error.statusCode = 401;
  error.code = "INVALID_CREDENTIALS";
  error.expose = true;

  return error;
}

function getRequestIp(req) {
  if (
    typeof req.ip === "string" &&
    req.ip
  ) {
    return req.ip;
  }

  return null;
}

function getUserAgent(req) {
  const userAgent = req.get("user-agent");

  return typeof userAgent === "string"
    ? userAgent
    : null;
}

export async function login(
  req,
  res,
  next,
) {
  try {
    const {
      email,
      password,
    } = req.validated.body;

    const user =
      await authenticateUserByEmail({
        email,
        password,
      });

    if (!user) {
      return next(
        createInvalidCredentialsError(),
      );
    }

    const existingToken =
      req.cookies?.[
        authConfig.sessionCookieName
      ];

    if (existingToken) {
      await revokeSessionToken(
        existingToken,
      );
    }

    const session =
      await createSession({
        userId: user.id,
        ipAddress: getRequestIp(req),
        userAgent: getUserAgent(req),
      });

    res.cookie(
      authConfig.sessionCookieName,
      session.token,
      getSessionCookieOptions(),
    );

    return res.status(200).json({
      ok: true,

      user,

      session: {
        expiresAt:
          session.expiresAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(
  req,
  res,
) {
  return res.status(200).json({
    ok: true,
    user: req.user,
  });
}

export async function logout(
  req,
  res,
  next,
) {
  try {
    const token =
      req.cookies?.[
        authConfig.sessionCookieName
      ];

    if (token) {
      await revokeSessionToken(token);
    }

    res.clearCookie(
      authConfig.sessionCookieName,
      getClearSessionCookieOptions(),
    );

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return next(error);
  }
}
