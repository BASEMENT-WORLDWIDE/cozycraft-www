import type { User } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import humanId from "human-id";
import { db } from "~/db.server";
import { reloadWhitelist } from "~/rcon.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const referralCode = url.searchParams.get("code");
  const signatureNonce = humanId();

  invariant(referralCode, "No referral code present.");

  return json({
    signatureNonce,
    referralCode,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const referralCode = formData.get("referral-code");
  const username = formData.get("username");
  const publicAddress = formData.get("public-address");

  if (typeof referralCode !== "string") {
    throw new Error("No referral code present.");
  }

  if (typeof username !== "string") {
    throw new Error("No Minecraft username present.");
  }

  let referral = await db.userReferral.findUniqueOrThrow({
    where: {
      code: referralCode,
    },
    select: {
      id: true,
      status: true,
      mojangUUID: true,
    },
  });

  if (referral.status === "accepted") {
    throw new Error("This referral has already been redeemed.");
  }

  if (referral.status === "expired") {
    throw new Error("This referral has expired.");
  }

  let user: User | undefined;

  if (typeof publicAddress === "string") {
    user = await db.user.create({
      data: {
        status: "active",
        publicAddress,
      },
    });
  }

  await db.$transaction([
    db.minecraftAccount.create({
      data: {
        username,
        referral: {
          connect: {
            id: referral.id,
          },
        },
        status: "active",
        mojangUUID: referral.mojangUUID,
        user: user
          ? {
              connect: {
                publicAddress: user.publicAddress,
              },
            }
          : undefined,
      },
    }),
    db.userReferral.update({
      where: { id: referral.id },
      data: {
        status: "accepted",
      },
    }),
  ]);

  await reloadWhitelist();

  return redirect("/?success=true");
};

const RedeemReferralCodePage = () => {
  const { referralCode, signatureNonce } = useLoaderData<typeof loader>();
  return (
    <form method="post" action="/redeem">
      <input type="hidden" name="nonce" defaultValue={signatureNonce} />
      <input type="hidden" name="referral-code" defaultValue={referralCode} />
      <div>
        <label>
          Minecraft Username
          <input
            type="text"
            name="username"
            placeholder="Enter your Minecraft username"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Connect your wallet (Optional)
          <input type="hidden" name="public-address" />
          <button type="button">Connect</button>
        </label>
      </div>
      <div>
        <button type="submit">Join Cozycraft</button>
      </div>
    </form>
  );
};

export default RedeemReferralCodePage;
