import type { UserOnboardStatus } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { auth } from "~/auth.server";
import { OnboardingSection } from "~/components/OnboardingSection";
import { UserBit } from "~/components/UserBit";
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

  if (onboardingState !== null) {
    if (onboardingState === "link_discord") {
      return redirect(`/redeem/${referralCode}/link`);
    }
    if (onboardingState === "join_discord") {
      return redirect(`/redeem/${referralCode}/join`);
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
          avatar: true,
          displayName: true,
          discordDiscriminator: true,
        },
      },
    },
  });

  return json({
    username: referral.username,
    referralCode: referral.code,
    referredByName: `${referral.referredBy.displayName}#${referral.referredBy.discordDiscriminator}`,
    referredByAvatar: referral.referredBy.avatar,
  });
};

// export const action = async ({ request }: ActionArgs) => {
//   const formData = await request.formData();
//   const referralCode = formData.get("referral-code");
//   const user = await auth.isAuthenticated(request);

//   if (user) {
//     throw new Error(
//       "You've already signed up. You can link an account through your profile menu."
//     );
//   }

//   if (typeof referralCode !== "string") {
//     throw new Error("No referral code present.");
//   }

//   let referral = await db.userReferral.findUniqueOrThrow({
//     where: {
//       code: referralCode,
//     },
//     select: {
//       id: true,
//       status: true,
//       mojangUUID: true,
//       username: true,
//       accountType: true,
//     },
//   });

//   if (referral.status === "accepted") {
//     throw new Error("This referral has already been redeemed.");
//   }

//   if (referral.status === "expired") {
//     throw new Error("This referral has expired.");
//   }

//   const session = await getSession(request.headers.get("Cookie"));
//   const onboardingState = (session.get("onboarding") ||
//     null) as UserOnboardStatus | null;

//   if (onboardingState !== null) {
//     throw new Error("Invalid onboarding state.");
//   }

//   session.set("onboarding", "join_discord");

//   return redirect(`/redeem/${referralCode}/join`, {
//     headers: {
//       "Set-Cookie": await commitSession(session),
//     },
//   });
// };

const RedeemReferralCodePage = () => {
  const { username, referralCode, referredByName, referredByAvatar } =
    useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center text-white max-w-3xl mx-auto h-full">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="col-span-full sm:col-span-9 flex flex-col gap-5">
          <OnboardingSection
            title={
              <>
                Hey there <span className="font-semibold">{username}</span>!
              </>
            }
          >
            <p className="text-xl">
              Welcome to Cozycraft, a casual Minecraft survival experience.
              We've heard so many great things about you from{" "}
              <UserBit avatar={referredByAvatar} username={referredByName} />,
              and we're thrilled to have you join our community.
            </p>
            <form
              method="post"
              action="/redeem"
              className="flex flex-col gap-2 w-full"
            >
              <input
                type="hidden"
                name="referral-code"
                defaultValue={referralCode}
              />
              <div>
                <button
                  type="button"
                  className="bg-lime-400 text-lime-800 rounded-2xl w-full font-semibold py-3 text-xl hover:bg-lime-600 transition-all hover:text-lime-900 shadow-sm shadow-lime-900/20"
                >
                  Get Started
                </button>
              </div>
            </form>
          </OnboardingSection>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:col-span-3"></div>
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
