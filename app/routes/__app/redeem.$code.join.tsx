import type { UserOnboardStatus } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { auth } from "~/auth.server";
import { db } from "~/db.server";
import { getSession } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const referralCode = params.code;
  invariant(referralCode, "No referral code present.");
  const user = await auth.isAuthenticated(request);

  if (user) {
    return redirect("/");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const onboardingState = (session.get("onboarding") ||
    null) as UserOnboardStatus | null;

  if (onboardingState !== "join_discord") {
    if (onboardingState === "link_discord") {
      return redirect(`/redeem/${referralCode}/link`);
    }
    return redirect("/");
  }

  const referral = await db.userReferral.findUniqueOrThrow({
    where: { code: referralCode },
    select: {
      code: true,
      username: true,
      referredBy: {
        select: {
          displayName: true,
          discordDiscriminator: true,
        },
      },
    },
  });

  return json({
    username: referral.username,
    referralCode: referral.code,
    referredBy: `${referral.referredBy.displayName}#${referral.referredBy.discordDiscriminator}`,
  });
};

const RedeemJoinDiscordPage = () => {
  const { username, referralCode, referredBy } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center text-white max-w-3xl mx-auto">
      <div className="text-justify">
        <h1 className="text-7xl font-semibold mb-6">Hey there {username}!</h1>
        <h2 className="text-4xl font-medium mb-2 leading-normal">
          Welcome to Cozycraft, a casual Minecraft survival experience. We've
          heard so many great things about you from {referredBy}, and we're
          thrilled to have you join our community.
        </h2>
      </div>
      <form
        method="post"
        action="/redeem"
        className="flex flex-col gap-2 w-full"
      >
        <input type="hidden" name="referral-code" defaultValue={referralCode} />
        <div>
          <button
            type="button"
            className="bg-lime-400 text-lime-800 rounded-3xl w-full font-semibold py-6 text-2xl hover:bg-lime-600 transition-all hover:text-lime-900 shadow-sm shadow-lime-900"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default RedeemJoinDiscordPage;
