import type { UserOnboardStatus } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { auth } from "~/auth.server";
import { db } from "~/db.server";
import { commitSession, getSession } from "~/session.server";

export const loader = async (_args: LoaderArgs) => {
  return json({ error: "Bad Request" }, { status: 400 });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await auth.isAuthenticated(request);

  if (user) {
    throw new Error(
      "You've already signed up. You can link an account through your profile menu."
    );
  }

  const formData = await request.formData();
  const referralCode = formData.get("referral-code");

  if (typeof referralCode !== "string") {
    throw new Error("No referral code present.");
  }

  let referral = await db.userReferral.findUniqueOrThrow({
    where: {
      code: referralCode,
    },
    select: {
      id: true,
      status: true,
      mojangUUID: true,
      username: true,
      accountType: true,
    },
  });

  if (referral.status === "accepted") {
    throw new Error("This referral has already been redeemed.");
  }

  if (referral.status === "expired") {
    throw new Error("This referral has expired.");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const onboardingState = (session.get("onboarding") ||
    null) as UserOnboardStatus | null;

  if (onboardingState !== "join_discord") {
    throw new Error("Invalid onboarding state.");
  }

  session.set("onboarding", "link_discord");

  return redirect(`/redeem/${referralCode}/link`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
