import { env } from "./env.js";

export const databaseConfig = Object.freeze({
  connectionString: env.DATABASE_URL,

  max: env.NODE_ENV === "production" ? 20 : 10,
  min: 0,

  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,

  application_name: "siberian-delicacies",
});
