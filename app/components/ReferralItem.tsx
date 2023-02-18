import type { MinecraftAccountType, ReferralStatus } from "@prisma/client";
import clsx from "clsx";
import { useCallback } from "react";
import { IconJava } from "./IconJava";
import { IconMicrosoft } from "./IconMicrosoft";

type ReferralItemProps = {
  minecraftType: MinecraftAccountType;
  username: string;
  referralStatus: ReferralStatus;
  referralCode: string;
};

export const ReferralItem = ({
  minecraftType,
  username,
  referralStatus,
  referralCode,
}: ReferralItemProps) => {
  const handleCopyReferralLink = useCallback(() => {
    if (!navigator.clipboard) return undefined;
    navigator.clipboard.writeText(
      `https://cozycraft.fun/redeem/${referralCode}`
    );
  }, [referralCode]);
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-shrink-0 bg-slate-100 p-2 rounded-lg">
        {minecraftType === "bedrock" ? (
          <IconMicrosoft className="w-8 h-8" />
        ) : (
          <IconJava className="w-8 h-8" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{username}</p>
        <p
          className={clsx("text-sm", {
            "text-orange-500": referralStatus === "pending",
            "text-red-500": referralStatus === "expired",
            "text-emerald-500": referralStatus === "accepted",
          })}
        >
          {`${referralStatus.charAt(0).toUpperCase()}${referralStatus.substring(
            1
          )}`}
        </p>
      </div>
      <div>
        <button
          type="button"
          onClick={handleCopyReferralLink}
          className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
};
