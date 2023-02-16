import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import humanId from "human-id";
import { auth } from "~/auth.server";
import { Button } from "~/components/Button";
import { CreateReferralForm } from "~/components/CreateReferralForm";
import { Input } from "~/components/Input";
import { ReferralItem } from "~/components/ReferralItem";
import { db } from "~/db.server";
import { getMojangUUID } from "~/mojang";
import { toMojangUUID } from "~/utils";
import {
  getXboxProfileXUID,
  hexXUIDToMojangUUID,
  xUIDToHex,
} from "~/xbox.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const success = url.searchParams.get("success");
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

  return json({
    referrals,
    success:
      typeof success === "string"
        ? `Successfully created referral code for ${success}.`
        : undefined,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await auth.isAuthenticated(request, { failureRedirect: "/" });
  const formData = await request.formData();
  const username = formData.get("username");

  if (typeof username !== "string") {
    throw new Error("No Minecraft username present.");
  }

  let mojangUUID = await getMojangUUID(username);

  if (typeof mojangUUID !== "string") {
    throw new Error("The Minecraft account does not exist.");
  }

  let referral = await db.userReferral.create({
    data: {
      code: humanId(),
      mojangUUID,
      username,
      status: "pending",
      referredBy: {
        connect: {
          id: user.id,
        },
      },
      // expiresAt: // TODO expiry.
    },
  });

  return redirect(`/referrals?success=${username}`);
};

const RedeemReferralCodePage = () => {
  const { referrals, success } = useLoaderData<typeof loader>();
  return (
    <div className="mx-4 sm:mx-0">
      {success && (
        <div className="bg-emerald-300 text-white rounded-md p-3">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-6">
        <div className="col-span-full sm:col-span-3">
          <h2 className="text-2xl font-semibold mb-4 text-blue-50">
            Refer a Friend
          </h2>
          <div className="bg-white rounded-2xl p-4">
            <CreateReferralForm />
          </div>
        </div>
        <div className="col-span-full sm:col-span-4">
          <h3 className="text-2xl font-semibold mb-4 text-blue-50">
            Referrals
          </h3>
          <div className="flex flex-col bg-white rounded-2xl divide-y divide-stone-200">
            {referrals.map((referral) => (
              <ReferralItem
                key={referral.id}
                minecraftType="java"
                username={referral.username}
                referralStatus={referral.status}
                referralCode={referral.code}
              />
              // <div key={referral.id}>
              //   <div>
              //     <strong>{referral.username}</strong>
              //   </div>
              //   <div>
              //     <small>Referral Status: {referral.status}</small>
              //   </div>
              //   <div>
              //     <small>Created At: {referral.createdAt}</small>
              //   </div>
              //   {/* <small>{referral.expiresAt}</small> */}
              //   <div>
              //     <small>Referral Link:</small>
              //     <div>
              //       <code className="text-xs bg-slate-400 p-1 text-slate-50 rounded-md">
              //         https://cozycraft-www.vercel.app/redeem?code=
              //         {referral.code}
              //       </code>
              //     </div>
              //   </div>
              // </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
