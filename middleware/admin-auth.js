import {
  requireRoles,
} from "./roles.js";

export const adminAuth = requireRoles(
  "OWNER",
  "STAFF",
);
