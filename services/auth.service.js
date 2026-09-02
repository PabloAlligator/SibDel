import * as argon2 from "argon2";

import {
  createHash,
  randomBytes,
} from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { authConfig } from "../config/auth.js";

const ARGON2_OPTIONS = Object.freeze({
  type: argon2.argon2id,
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
});

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 256;

function isValidPasswordValue(password) {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

function normalizeIpAddress(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 64);
}

function normalizeUserAgent(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 1000);
}

export async function hashPassword(password) {
  if (!isValidPasswordValue(password)) {
    throw new TypeError(
      `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    );
  }

  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  passwordHash,
  password,
) {
  if (
    typeof passwordHash !== "string" ||
    !passwordHash ||
    !isValidPasswordValue(password)
  ) {
    return false;
  }

  try {
    return await argon2.verify(
      passwordHash,
      password,
    );
  } catch {
    return false;
  }
}

export function generateSessionToken() {
  return randomBytes(48).toString("base64url");
}

export function hashSessionToken(token) {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 256
  ) {
    throw new TypeError("Invalid session token.");
  }

  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function authenticateUserByEmail({
  email,
  password,
}) {
  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return null;
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },

    select: {
      id: true,
      email: true,
      phone: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const passwordValid =
    await verifyPassword(
      user.passwordHash,
      password,
    );

  if (!passwordValid) {
    return null;
  }

  const {
    passwordHash: _passwordHash,
    ...safeUser
  } = user;

  return safeUser;
}

export async function createSession({
  userId,
  ipAddress = null,
  userAgent = null,
}) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TypeError("Valid userId is required.");
  }

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + authConfig.sessionTtlMs,
  );

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  await prisma.$transaction(async (transaction) => {
    await transaction.userSession.deleteMany({
      where: {
        userId,

        expiresAt: {
          lte: now,
        },
      },
    });

    const sessionsToRemove =
      await transaction.userSession.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        skip: authConfig.maxSessionsPerUser - 1,

        select: {
          id: true,
        },
      });

    if (sessionsToRemove.length > 0) {
      await transaction.userSession.deleteMany({
        where: {
          id: {
            in: sessionsToRemove.map(
              (session) => session.id,
            ),
          },
        },
      });
    }

    await transaction.userSession.create({
      data: {
        userId,
        tokenHash,

        ipAddress:
          normalizeIpAddress(ipAddress),

        userAgent:
          normalizeUserAgent(userAgent),

        expiresAt,
        lastUsedAt: now,
      },
    });
  });

  return {
    token,
    expiresAt,
  };
}

export async function resolveSessionToken(token) {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 256
  ) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session =
    await prisma.userSession.findUnique({
      where: {
        tokenHash,
      },

      select: {
        id: true,
        userId: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,

        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

  if (!session) {
    return null;
  }

  const now = new Date();

  if (
    session.expiresAt <= now ||
    !session.user.isActive
  ) {
    await prisma.userSession.deleteMany({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  const touchThreshold = new Date(
    now.getTime() -
      authConfig.sessionTouchIntervalMs,
  );

  if (session.lastUsedAt < touchThreshold) {
    await prisma.userSession.updateMany({
      where: {
        id: session.id,

        lastUsedAt: {
          lt: touchThreshold,
        },
      },

      data: {
        lastUsedAt: now,
      },
    });
  }

  return {
    session: {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastUsedAt: session.lastUsedAt,
    },

    user: session.user,
  };
}

export async function revokeSessionToken(token) {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 256
  ) {
    return;
  }

  const tokenHash = hashSessionToken(token);

  await prisma.userSession.deleteMany({
    where: {
      tokenHash,
    },
  });
}

export async function revokeAllUserSessions(userId) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TypeError("Valid userId is required.");
  }

  await prisma.userSession.deleteMany({
    where: {
      userId,
    },
  });
}
