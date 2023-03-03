import type { SessionUser } from "./auth.server";

export const isOnboarded = (user: SessionUser) =>
  user.onboardStatus === "finish";
