import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import humanId from "human-id";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { db } from "~/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const publicAddress = params.publicAddress;
  const signatureNonce = humanId();

  const user = await db.user.findUniqueOrThrow({
    where: { publicAddress },
    select: { id: true },
  });

  const referrals = await db.userReferral.findMany({
    where: {
      referredById: {
        in: user.id,
      },
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
  const publicAddress = formData.get("public-address");

  if (typeof username !== "string") {
    throw new Error("No Minecraft username present.");
  }

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
          publicAddress: "",
        },
      },
      // expiresAt: // TODO expiry.
    },
  });

  return redirect("/");
};

const RedeemReferralCodePage = () => {
  const { referrals, signatureNonce } = useLoaderData<typeof loader>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      <form
        method="post"
        className="col-span-full md:col-span-2 flex flex-col gap-2"
      >
        <input type="hidden" name="nonce" defaultValue={signatureNonce} />
        <input type="hidden" name="signature" />
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
      <div>
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
