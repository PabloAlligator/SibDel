const AVAILABLE_ROLES = new Set([
  "CUSTOMER",
  "STAFF",
  "OWNER",
]);

function createUnauthorizedError() {
  const error = new Error(
    "Необходимо войти в аккаунт.",
  );

  error.statusCode = 401;
  error.code = "UNAUTHORIZED";
  error.expose = true;

  return error;
}

function createForbiddenError() {
  const error = new Error(
    "Недостаточно прав для выполнения операции.",
  );

  error.statusCode = 403;
  error.code = "FORBIDDEN";
  error.expose = true;

  return error;
}

export function requireRoles(...roles) {
  if (roles.length === 0) {
    throw new TypeError(
      "At least one role is required.",
    );
  }

  for (const role of roles) {
    if (!AVAILABLE_ROLES.has(role)) {
      throw new TypeError(
        `Unknown user role: ${role}`,
      );
    }
  }

  const allowedRoles = new Set(roles);

  return function roleMiddleware(
    req,
    _res,
    next,
  ) {
    if (!req.auth?.user) {
      return next(
        createUnauthorizedError(),
      );
    }

    if (
      !allowedRoles.has(
        req.auth.user.role,
      )
    ) {
      return next(
        createForbiddenError(),
      );
    }

    return next();
  };
}
