import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import humanId from "human-id";
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
      return data.id;
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
    <div>
      <form method="post">
        <input type="hidden" name="nonce" defaultValue={signatureNonce} />
        <input type="hidden" name="signature" />
        <div>
          <label>
            Minecraft Username
            <input
              type="text"
              name="username"
              placeholder="Enter your friends Minecraft username"
              required
            />
          </label>
        </div>
        <div>
          <button type="submit">Create Referral</button>
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
