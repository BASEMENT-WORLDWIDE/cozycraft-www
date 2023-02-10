import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import humanId from "human-id";
import { auth } from "~/auth.server";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { db } from "~/db.server";
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

  const getMojangUUID = async (username: string) => {
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    );
    if (!response.ok) {
      const xuid = await getXboxProfileXUID(username);
      if (!xuid) {
        return null;
      }
      return hexXUIDToMojangUUID(xUIDToHex(xuid));
    }
    const data: { id: string; name: string } = await response.json();
    return toMojangUUID(data.id);
  };

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
    <div>
      {success && (
        <div className="bg-emerald-300 text-white rounded-md p-3">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-6">
        <form
          action="/referrals"
          method="post"
          className="col-span-full md:col-span-2 flex flex-col gap-2"
        >
          <h3 className="text-xl font-semibold mb-1">Refer a Friend</h3>
          <Input
            name="username"
            label="Minecraft Username"
            type="text"
            placeholder="Enter your friends Minecraft username"
            required
          />
          <div>
            <Button type="submit" intent="success">
              Create Referral
            </Button>
          </div>
        </form>
        <div className="col-span-full md:col-span-5">
          <h2 className="text-2xl font-semibold mb-1">Referrals</h2>
          <div className="flex flex-col gap-4">
            {referrals.map((referral) => (
              <div key={referral.id}>
                <div>
                  <strong>{referral.username}</strong>
                </div>
                <div>
                  <small>Referral Status: {referral.status}</small>
                </div>
                <div>
                  <small>Created At: {referral.createdAt}</small>
                </div>
                {/* <small>{referral.expiresAt}</small> */}
                <div>
                  <small>Referral Link:</small>
                  <div>
                    <code className="text-xs bg-slate-400 p-1 text-slate-50 rounded-md">
                      https://cozycraft-www.vercel.app/redeem?code=
                      {referral.code}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
