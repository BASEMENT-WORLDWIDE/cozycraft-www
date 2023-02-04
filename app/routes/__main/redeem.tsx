import type { User } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import humanId from "human-id";
import { db } from "~/db.server";
import { addToRuntimeWhitelist } from "~/rcon.server";
import { Button } from "~/components/Button";
import { useSignMessage } from "wagmi";
import { useCallback } from "react";
import { verifyMessage } from "ethers/lib/utils.js";

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
  const signature = formData.get("signature");
  const nonce = formData.get("signatureNonce");

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
    },
  });

  if (referral.status === "accepted") {
    throw new Error("This referral has already been redeemed.");
  }

  if (referral.status === "expired") {
    throw new Error("This referral has expired.");
  }

  let user: User | undefined;

  if (typeof signature === "string") {
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

  await addToRuntimeWhitelist(referral.username);

  return redirect("/?success=true");
};

const RedeemReferralCodePage = () => {
  const { referralCode, signatureNonce } = useLoaderData<typeof loader>();
  const { data, signMessageAsync } = useSignMessage();
  const handleCreateUser = useCallback(async () => {
    if (typeof data !== "undefined") {
      return;
    }
    await signMessageAsync({
      message: `Associate Minecraft account with wallet — ${signatureNonce}`,
    });
  }, [data, signatureNonce, signMessageAsync]);
  return (
    <form method="post" action="/redeem" className="flex flex-col gap-2">
      <input type="hidden" name="nonce" defaultValue={signatureNonce} />
      <input type="hidden" name="signature" defaultValue={data} />
      <input type="hidden" name="referral-code" defaultValue={referralCode} />
      <div>
        <label className="block" htmlFor="connect-wallet">
          Connect your wallet (Optional)
        </label>
        <Button
          intent="default"
          type="button"
          name="connect-wallet"
          onClick={handleCreateUser}
        >
          Connect
        </Button>
      </div>
      <div>
        <Button type="submit" intent="success">
          Join Cozycraft
        </Button>
      </div>
    </form>
  );
};

export default RedeemReferralCodePage;
