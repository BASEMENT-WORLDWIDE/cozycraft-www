import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import humanId from "human-id";
import { memo } from "react";
import { auth } from "~/auth.server";
import { Button } from "~/components/Button";
import { CreateReferralForm } from "~/components/CreateReferralForm";
import { Input } from "~/components/Input";
import { ReferralItem } from "~/components/ReferralItem";
import { db } from "~/db.server";
import { getMojangUUID } from "~/mojang";

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const messageText = url.searchParams.get("message");
  const messageType = url.searchParams.get("type");
  const user = await auth.isAuthenticated(request, { failureRedirect: "/" });

  const referrals = await db.userReferral.findMany({
    where: {
      referredById: user.id,
    },
    select: {
      id: true,
      code: true,
      username: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let message = undefined;
  if (
    (typeof messageText === "string" && messageType === "success") ||
    messageType === "error"
  ) {
    message = {
      title: `${messageType.charAt(0).toUpperCase()}${messageType.substring(
        1
      )}`,
      text: messageText,
      type: messageType,
    };
  }

  return json({
    referrals,
    message,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await auth.isAuthenticated(request, { failureRedirect: "/" });
  const formData = await request.formData();
  const username = formData.get("username");

  if (typeof username !== "string") {
    throw new Error("No Minecraft username present.");
  }

  try {
    const [mojangUUID, accountType] = await getMojangUUID(username);

    let referral = await db.userReferral.create({
      data: {
        code: humanId(),
        mojangUUID,
        username,
        accountType,
        status: "pending",
        referredBy: {
          connect: {
            id: user.id,
          },
        },
        // expiresAt: // TODO expiry.
      },
    });

    return redirect(
      `/referrals?message=Successfully created referral for ${username}&type=success`
    );
  } catch (err) {
    if (typeof err === "string") {
      return redirect(`/referrals?message=${err}&type=error`);
    }
    console.error(err);
    return redirect(`/referrals?message=Internal Server Error&type=error`);
  }
};

const MemoizedReferralItem = memo(ReferralItem);

const RedeemReferralCodePage = () => {
  const { referrals, message } = useLoaderData<typeof loader>();
  return (
    <div className="mx-4 sm:mx-0">
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-6">
        <div className="col-span-full sm:col-span-3">
          <h2 className="text-2xl font-semibold mb-4 text-blue-50">
            Refer a Friend
          </h2>
          <div className="bg-white rounded-2xl p-4">
            <CreateReferralForm />
          </div>
          {message && (
            <div
              className={clsx("rounded-xl p-4 mt-4", {
                "bg-emerald-300 text-emerald-900": message.type === "success",
                "bg-red-300 text-red-900": message.type === "error",
              })}
            >
              <p>
                <strong>{message.title}</strong>
              </p>
              <p>{message.text}</p>
            </div>
          )}
        </div>
        <div className="col-span-full sm:col-span-4">
          <h3 className="text-2xl font-semibold mb-4 text-blue-50">
            Referrals
          </h3>
          <div className="flex flex-col bg-white rounded-2xl divide-y divide-stone-200">
            {referrals.map((referral) => (
              <MemoizedReferralItem
                key={referral.id}
                minecraftType="java"
                username={referral.username}
                referralStatus={referral.status}
                referralCode={referral.code}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
