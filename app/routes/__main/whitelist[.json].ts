import { json } from "@remix-run/node";
import { db } from "~/db.server";

export const loader = async () => {
  const minecraftAccounts = await db.minecraftAccount.findMany({
    where: { status: "active" },
    select: {
      username: true,
      mojangUUID: true,
    },
  });
  const whitelist = minecraftAccounts.map((account) => ({
    uuid: account.mojangUUID,
    name: account.username,
  }));
  json(whitelist);
};
