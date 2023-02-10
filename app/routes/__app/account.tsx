import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
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

const AccountPage = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h2>Minecraft Accounts</h2>
      <div>
        {data.minecraftAccounts.map((account) => (
          <div key={account.id}>{account.username}</div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
