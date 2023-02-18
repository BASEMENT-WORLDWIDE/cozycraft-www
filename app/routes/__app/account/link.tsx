import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { db } from "~/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const minecraftAccounts = await db.minecraftAccount.findMany({
    where: {
      userId: user.id,
    },
  });

  return json({
    minecraftAccounts,
  });
};
export const action = async ({}: ActionArgs) => {};

const AccountLinkMinecraftPage = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Minecraft Accounts</h1>
      <div>
        {data.minecraftAccounts.map((account) => (
          <div key={account.id}>{account.username}</div>
        ))}
      </div>
    </>
  );
};

export default AccountLinkMinecraftPage;
