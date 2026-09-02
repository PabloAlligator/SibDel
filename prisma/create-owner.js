import { createInterface } from "node:readline/promises";

import { z } from "zod";

import {
  connectDatabase,
  disconnectDatabase,
  prisma,
} from "../lib/prisma.js";

import {
  hashPassword,
} from "../services/auth.service.js";

const ownerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Некорректный email.")
    .max(191, "Email слишком длинный."),

  password: z
    .string()
    .min(
      12,
      "Пароль OWNER должен содержать минимум 12 символов.",
    )
    .max(
      128,
      "Пароль OWNER слишком длинный.",
    )
    .regex(
      /[a-z]/,
      "Пароль должен содержать строчную латинскую букву.",
    )
    .regex(
      /[A-Z]/,
      "Пароль должен содержать заглавную латинскую букву.",
    )
    .regex(
      /\d/,
      "Пароль должен содержать цифру.",
    )
    .regex(
      /[^A-Za-z0-9]/,
      "Пароль должен содержать специальный символ.",
    ),
});

function readHiddenInput(promptText) {
  return new Promise((resolve, reject) => {
    if (
      !process.stdin.isTTY ||
      typeof process.stdin.setRawMode !== "function"
    ) {
      reject(
        new Error(
          "Hidden password input requires an interactive terminal.",
        ),
      );

      return;
    }

    let value = "";
    let finished = false;

    const previousRawMode =
      process.stdin.isRaw === true;

    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(previousRawMode);
      process.stdin.pause();
    };

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;

      cleanup();

      process.stdout.write("\n");

      resolve(value);
    };

    const cancel = () => {
      if (finished) {
        return;
      }

      finished = true;

      cleanup();

      process.stdout.write("\n");

      reject(
        new Error(
          "OWNER creation cancelled.",
        ),
      );
    };

    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          cancel();
          return;
        }

        if (
          character === "\r" ||
          character === "\n"
        ) {
          finish();
          return;
        }

        if (
          character === "\u0008" ||
          character === "\u007f"
        ) {
          if (value.length > 0) {
            value = value.slice(0, -1);

            process.stdout.write(
              "\b \b",
            );
          }

          continue;
        }

        value += character;

        process.stdout.write("*");
      }
    };

    process.stdout.write(promptText);

    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function requestOwnerCredentials() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let email;

  try {
    email = (
      await readline.question(
        "OWNER email: ",
      )
    )
      .trim()
      .toLowerCase();
  } finally {
    readline.close();
  }

  const password =
    await readHiddenInput(
      "OWNER password: ",
    );

  const passwordConfirmation =
    await readHiddenInput(
      "Repeat OWNER password: ",
    );

  if (
    password !==
    passwordConfirmation
  ) {
    throw new Error(
      "Passwords do not match.",
    );
  }

  return ownerSchema.parse({
    email,
    password,
  });
}

async function createOrResetOwner({
  email,
  password,
}) {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        role: true,
      },
    });

  const passwordHash =
    await hashPassword(password);

  if (!existingUser) {
    const owner =
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "OWNER",
          isActive: true,
        },

        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

    return {
      action: "created",
      owner,
    };
  }

  if (
    existingUser.role !== "OWNER"
  ) {
    throw new Error(
      "A user with this email already exists and is not an OWNER. Automatic privilege escalation is blocked.",
    );
  }

  const owner =
    await prisma.$transaction(
      async (transaction) => {
        const updatedOwner =
          await transaction.user.update({
            where: {
              id: existingUser.id,
            },

            data: {
              passwordHash,
              isActive: true,
            },

            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          });

        await transaction.userSession.deleteMany({
          where: {
            userId: existingUser.id,
          },
        });

        return updatedOwner;
      },
    );

  return {
    action: "password-reset",
    owner,
  };
}

async function main() {
  await connectDatabase();

  const credentials =
    await requestOwnerCredentials();

  const result =
    await createOrResetOwner(
      credentials,
    );

  if (
    result.action === "created"
  ) {
    console.log(
      `OWNER created successfully: ${result.owner.email}`,
    );
  } else {
    console.log(
      `OWNER password updated and existing sessions revoked: ${result.owner.email}`,
    );
  }
}

main()
  .catch((error) => {
    if (error instanceof z.ZodError) {
      for (
        const issue
        of error.issues
      ) {
        console.error(
          `Validation error: ${issue.message}`,
        );
      }
    } else {
      console.error(
        error.message ||
          "OWNER creation failed.",
      );
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
