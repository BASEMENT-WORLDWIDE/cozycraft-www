import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { memo, useCallback } from "react";
import { auth } from "~/auth.server";
import { ReferralItem } from "~/components/ReferralItem";
import { db } from "~/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const { id: userId } = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const user = await db.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    select: {
      referralCode: true,
      referrals: {
        select: {
          id: true,
          displayName: true,
          discordDiscriminator: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({
    referrals: user.referrals,
    referralCount: user.referrals.length,
    referralCode: user.referralCode,
  });
};

const MemoizedReferralItem = memo(ReferralItem);

const RedeemReferralCodePage = () => {
  const { referrals, referralCount, referralCode } =
    useLoaderData<typeof loader>();
  const handleCopyReferralLink = useCallback(() => {
    if (!navigator.clipboard) return undefined;
    navigator.clipboard.writeText(
      `https://cozycraft.fun/redeem/${referralCode}`
    );
  }, [referralCode]);
  return (
    <div className="mx-4 sm:mx-0">
      <div className="flex flex-row">
        <h3 className="text-2xl font-semibold mb-4 text-blue-50">
          Referrals ({referralCount})
        </h3>
        <button
          type="button"
          onClick={handleCopyReferralLink}
          className="ml-auto inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Copy Referral Link
        </button>
      </div>
      <div className="flex flex-col bg-white rounded-2xl divide-y divide-stone-200">
        {referrals.map((referral) => (
          <MemoizedReferralItem
            key={referral.id}
            displayName={referral.displayName}
            discriminator={referral.discordDiscriminator}
            joinDate={referral.createdAt}
          />
        ))}
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
