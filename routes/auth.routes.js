import { Router } from "express";
import { z } from "zod";

import {
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import {
  authRateLimiter,
} from "../middleware/rate-limit.js";

import {
  requireAuth,
} from "../middleware/auth.js";

import {
  validate,
} from "../middleware/validate.js";

const router = Router();

const loginBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email(
        "Введите корректный email.",
      )
      .max(
        191,
        "Email слишком длинный.",
      )
      .transform((value) =>
        value.toLowerCase(),
      ),

    password: z
      .string()
      .min(
        1,
        "Введите пароль.",
      )
      .max(
        256,
        "Пароль слишком длинный.",
      ),
  })
  .strict();

router.post(
  "/login",
  authRateLimiter,
  validate({
    body: loginBodySchema,
  }),
  login,
);

router.get(
  "/me",
  requireAuth,
  getCurrentUser,
);

router.post(
  "/logout",
  logout,
);

export default router;
