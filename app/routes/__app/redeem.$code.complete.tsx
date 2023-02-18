import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { db } from "~/db.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const referralCode = params.code;

  invariant(referralCode, "No referral code present.");

  const referral = await db.userReferral.findUniqueOrThrow({
    where: { code: referralCode },
    select: {
      code: true,
      username: true,
      referredBy: {
        select: {
          displayName: true,
          discordDiscriminator: true,
        },
      },
    },
  });

  return json({
    username: referral.username,
    referralCode: referral.code,
    referredBy: `${referral.referredBy.displayName}#${referral.referredBy.discordDiscriminator}`,
  });
};

// export const action = async ({ request }: ActionArgs) => {
//   const formData = await request.formData();
//   const referralCode = formData.get("referral-code");

//   if (typeof referralCode !== "string") {
//     throw new Error("No referral code present.");
//   }

//   let referral = await db.userReferral.findUniqueOrThrow({
//     where: {
//       code: referralCode,
//     },
//     select: {
//       id: true,
//       status: true,
//       mojangUUID: true,
//       username: true,
//       accountType: true,
//     },
//   });

//   if (referral.status === "accepted") {
//     throw new Error("This referral has already been redeemed.");
//   }

//   if (referral.status === "expired") {
//     throw new Error("This referral has expired.");
//   }

//   // let user = await db.user.create({
//   //   data: {
//   //     status: "active",
//   //   },
//   // });

//   // await db.$transaction([
//   //   db.minecraftAccount.create({
//   //     data: {
//   //       username: referral.username,
//   //       accountType: referral.accountType,
//   //       referral: {
//   //         connect: {
//   //           id: referral.id,
//   //         },
//   //       },
//   //       status: "active",
//   //       mojangUUID: referral.mojangUUID,
//   //       // user: user
//   //       //   ? {
//   //       //       connect: {
//   //       //         publicAddress: user.publicAddress,
//   //       //       },
//   //       //     }
//   //       //   : undefined,
//   //     },
//   //   }),
//   //   db.userReferral.update({
//   //     where: { id: referral.id },
//   //     data: {
//   //       status: "accepted",
//   //     },
//   //   }),
//   // ]);

//   try {
//     await addToRuntimeWhitelist(referral.username);
//   } catch {}

//   return redirect("");
// };

const RedeemCompletePage = () => {
  const { username, referralCode, referredBy } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center text-white max-w-3xl mx-auto">
      <div className="text-justify">
        <h1 className="text-7xl font-semibold mb-6">Hey there {username}!</h1>
        <h2 className="text-4xl font-medium mb-2 leading-normal">
          Welcome to Cozycraft, a casual Minecraft survival experience. We've
          heard so many great things about you from {referredBy}, and we're
          thrilled to have you join our community.
        </h2>
      </div>
      <div>
        <h3>Rules</h3>
        <ul>
          <li>No usage of racial slurs, </li>
        </ul>
      </div>
    </div>
  );
};

export default RedeemCompletePage;
