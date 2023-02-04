import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import humanId from "human-id";
import { useCallback } from "react";
import { useSignMessage } from "wagmi";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { db } from "~/db.server";
import { verifySignature } from "~/ethers.server";

export const loader = async ({ params }: LoaderArgs) => {
  const publicAddress = params.publicAddress;
  const signatureNonce = humanId();

  const referrals = await db.userReferral.findMany({
    where: {
      referredById: publicAddress,
    },
    select: {
      id: true,
      code: true,
      username: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return json({
    signatureNonce,
    referrals,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const signature = formData.get("signature");
  const signatureNonce = formData.get("nonce");
  const username = formData.get("username");

  if (typeof username !== "string") {
    throw new Error("No Minecraft username present.");
  }

  if (typeof signature !== "string") {
    throw new Error("Invalid signature");
  }

  if (typeof signatureNonce !== "string") {
    throw new Error("Missing nonce");
  }

  const publicAddress = verifySignature(
    `Create a referral code — ${signatureNonce}`,
    signature
  );

  const getMojangUUID = async (username: string) => {
    try {
      const response = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${username}`
      );
      const data: { id: string; name: string } = await response.json();
      let expr =
        /([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]+)/gi;
      let formattedId = data.id.replace(expr, "$1-$2-$3-$4-$5");
      return formattedId;
    } catch {
      return null;
    }
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
          publicAddress,
        },
      },
      // expiresAt: // TODO expiry.
    },
  });

  return redirect("/");
};

const RedeemReferralCodePage = () => {
  const { referrals, signatureNonce } = useLoaderData<typeof loader>();
  const { data, signMessageAsync } = useSignMessage();
  const handleReferralAuthentication = useCallback(async () => {
    if (typeof data !== "undefined") {
      return;
    }
    await signMessageAsync({
      message: `Create a referral code — ${signatureNonce}`,
    });
  }, [data, signatureNonce, signMessageAsync]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-6">
      <form
        method="post"
        className="col-span-full md:col-span-2 flex flex-col gap-2"
      >
        <h3 className="text-xl font-semibold mb-1">Refer a Friend</h3>
        <input type="hidden" name="nonce" defaultValue={signatureNonce} />
        <input type="hidden" name="signature" defaultValue={data} />
        <Input
          name="username"
          label="Minecraft Username"
          type="text"
          placeholder="Enter your friends Minecraft username"
          required
        />
        <div>
          <Button
            type={data ? "submit" : "button"}
            intent="success"
            onClick={handleReferralAuthentication}
          >
            {data ? "Create Referral" : "Sign Referral"}
          </Button>
        </div>
      </form>
      <div className="col-span-full md:col-span-5">
        <h2 className="text-2xl font-semibold mb-1">Referrals</h2>
        {referrals.map((referral) => (
          <div key={referral.id}>
            <strong>{referral.username}</strong>
            <small>
              {referral.createdAt} | {referral.status}
            </small>
            <small>{referral.expiresAt}</small>
            {referral.code}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedeemReferralCodePage;
