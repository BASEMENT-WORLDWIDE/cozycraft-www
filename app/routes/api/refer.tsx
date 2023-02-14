import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { requireApiKey } from "~/api.server";
import { db } from "~/db.server";
import humanId from "human-id";
import { getMojangUUID } from "~/mojang";

const serverReferralSchema = zfd.formData({
  username: zfd.text(),
  accountType: zfd.text(z.enum(["java", "bedrock"]).default("java")),
  referredBy: zfd.text(),
});

export const action = async ({ request }: ActionArgs) => {
  try {
    requireApiKey(request);
    const formData = await request.formData();
    const { referredBy, accountType, username } =
      serverReferralSchema.parse(formData);
    const mojangUUID = await getMojangUUID(username);

    if (!mojangUUID) {
      throw `${username} does not exist.`;
    }

    const referrer = await db.minecraftAccount.findUniqueOrThrow({
      where: {
        username: referredBy,
      },
      select: {
        userId: true,
      },
    });

    const referral = await db.userReferral.create({
      data: {
        code: humanId(),
        username,
        accountType,
        mojangUUID,
        referredBy: {
          connect: {
            id: referrer.userId,
          },
        },
      },
    });

    return json({ url: `https://cozycraft.fun/redeem?code=${referral.code}` });
  } catch (err) {
    if (typeof err === "string") {
      return json({ error: err }, { status: 400 });
    }
    console.error(err);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
