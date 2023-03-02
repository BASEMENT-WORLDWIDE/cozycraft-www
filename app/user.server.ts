import type { SessionUser } from "./auth.server";

export const isOnboarded = (user: SessionUser) =>
  user.onboardStatus !== "complete_cozy" &&
  user.onboardStatus !== "complete_guest";
