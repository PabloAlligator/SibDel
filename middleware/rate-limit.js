import { rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function createRateLimiter({
  limit,
  identifier,
  message,
  skipSuccessfulRequests = false,
}) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,

    limit,

    identifier,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    skipSuccessfulRequests,

    handler(_req, res, _next, options) {
      return res.status(options.statusCode).json({
        ok: false,

        error: {
          code: "RATE_LIMITED",
          message,
        },
      });
    },
  });
}

export const apiRateLimiter = createRateLimiter({
  limit: 300,
  identifier: "api",
  message: "Слишком много запросов. Попробуйте немного позже.",
});

export const authRateLimiter = createRateLimiter({
  limit: 10,
  identifier: "auth",
  message: "Слишком много попыток входа. Попробуйте позже.",
  skipSuccessfulRequests: true,
});

export const sensitiveRateLimiter = createRateLimiter({
  limit: 30,
  identifier: "sensitive",
  message: "Слишком много запросов. Попробуйте немного позже.",
});
