const VALIDATION_TARGETS = ["body", "params", "query"];

function createValidationError(details) {
  const error = new Error("Переданы некорректные данные.");

  error.statusCode = 400;
  error.code = "VALIDATION_ERROR";
  error.details = details;
  error.expose = true;

  return error;
}

function formatIssues(target, issues) {
  return issues.map((issue) => ({
    target,

    path:
      issue.path.length > 0
        ? issue.path.map((part) => String(part)).join(".")
        : target,

    code: issue.code,

    message: issue.message,
  }));
}

export function validate(schemas) {
  if (!schemas || typeof schemas !== "object") {
    throw new TypeError("Validation schemas must be provided.");
  }

  const entries = Object.entries(schemas).filter(([target]) =>
    VALIDATION_TARGETS.includes(target),
  );

  if (entries.length === 0) {
    throw new TypeError(
      "At least one validation schema for body, params or query is required.",
    );
  }

  for (const [target, schema] of entries) {
    if (!schema || typeof schema.safeParseAsync !== "function") {
      throw new TypeError(
        `Validation schema for "${target}" must be a Zod schema.`,
      );
    }
  }

  return async function validationMiddleware(req, _res, next) {
    try {
      const validated = {
        ...(req.validated ?? {}),
      };

      const validationIssues = [];

      for (const [target, schema] of entries) {
        const result = await schema.safeParseAsync(req[target]);

        if (!result.success) {
          validationIssues.push(
            ...formatIssues(target, result.error.issues),
          );

          continue;
        }

        validated[target] = result.data;
      }

      if (validationIssues.length > 0) {
        return next(createValidationError(validationIssues));
      }

      req.validated = validated;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
