import type { User } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import humanId from "human-id";
import { db } from "~/db.server";
import { addToRuntimeWhitelist } from "~/rcon.server";
import { Button } from "~/components/Button";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { useCallback } from "react";
import { verifyMessage } from "ethers/lib/utils.js";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const referralCode = url.searchParams.get("code");
  const signatureNonce = humanId();

  invariant(referralCode, "No referral code present.");

  const referral = await db.userReferral.findUniqueOrThrow({
    where: { code: referralCode },
    select: {
      code: true,
      username: true,
      referredBy: {
        select: {
          publicAddress: true,
        },
      },
    },
  });

  return json({
    referral,
    signatureNonce,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const referralCode = formData.get("referral-code");
  const signature = formData.get("signature");
  const nonce = formData.get("signatureNonce");

  if (typeof referralCode !== "string") {
    throw new Error("No referral code present.");
  }

  console.log({ signature, nonce });

  let referral = await db.userReferral.findUniqueOrThrow({
    where: {
      code: referralCode,
    },
    select: {
      id: true,
      status: true,
      mojangUUID: true,
      username: true,
    },
  });

  if (referral.status === "accepted") {
    throw new Error("This referral has already been redeemed.");
  }

  if (referral.status === "expired") {
    throw new Error("This referral has expired.");
  }

  let user: User | undefined;

  if (typeof signature === "string" && signature.length > 0) {
    let publicAddress = verifyMessage(
      `Associate Minecraft account with wallet — ${nonce}`,
      signature
    );
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
        username: referral.username,
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

  try {
    await addToRuntimeWhitelist(referral.username);
  } catch {}

  return redirect("/?success=true");
};

const RedeemReferralCodePage = () => {
  const { referral, signatureNonce } = useLoaderData<typeof loader>();
  const { data, signMessageAsync } = useSignMessage();
  const { isConnected } = useAccount();
  const handleCreateUser = useCallback(async () => {
    if (typeof data !== "undefined") {
      return;
    }
    await signMessageAsync({
      message: `Associate Minecraft account with Wallet — ${signatureNonce}`,
    });
  }, [data, signatureNonce, signMessageAsync]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          Welcome {referral.username}!
        </h1>
        <h2 className="text-2xl font-semibold mb-2">
          You&apos;ve been referred by {referral.referredBy.publicAddress} to
          join Cozycraft!
        </h2>
      </div>
      <div className="p-3 bg-slate-200 text-slate-700 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">
          Are you a holder of Cozy Penguins?
        </h3>
        <p className="text-lg mb-2">
          Cozy Penguin holders are able to refer others to Cozycraft.{" "}
          <strong className="underline">
            Creating an account is completely optional.
          </strong>
          <br />
          Creating an account requires you to connect your wallet and provide a
          signature to ensure you are the owner of the address.
        </p>
        <Button
          intent="default"
          type="button"
          onClick={handleCreateUser}
          disabled={!isConnected}
          className="disabled:cursor-not-allowed"
        >
          Create Account
        </Button>
      </div>
      <form method="post" action="/redeem" className="flex flex-col gap-2">
        <input type="hidden" name="nonce" defaultValue={signatureNonce} />
        <input type="hidden" name="signature" defaultValue={data} />
        <input
          type="hidden"
          name="referral-code"
          defaultValue={referral.code}
        />
        <div>
          <Button
            className="w-full text-center justify-center"
            size="xl"
            type="submit"
            intent="success"
          >
            Join Cozycraft
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RedeemReferralCodePage;
