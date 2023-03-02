import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { Button } from "~/components/Button";
import { IconJava } from "~/components/IconJava";
import { IconMicrosoft } from "~/components/IconMicrosoft";
import { Input } from "~/components/Input";
import { db } from "~/db.server";
import { getMojangUUID } from "~/mojang";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const minecraftAccounts = await db.minecraftAccount.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      accountType: true,
      status: true,
      username: true,
      createdAt: true,
    },
  });

  return json({
    minecraftAccounts,
  });
};
export const action = async ({ request }: ActionArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const username = formData.get("username");
  if (typeof username !== "string") {
    return redirect("/accounts/link?message=Username is required&type=error");
  }
  try {
    const [mojangUUID, accountType] = await getMojangUUID(username);

    await db.minecraftAccount.create({
      data: {
        mojangUUID,
        username,
        accountType,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return redirect(
      `/account/link?message=Successfully linked ${username}&type=success`
    );
  } catch (err) {
    if (typeof err === "string") {
      return redirect(`/account/link?message=${err}&type=error`);
    }
    console.error(err);
    return redirect(`/account/link?message=Internal Server Error&type=error`);
  }
};

const AccountLinkMinecraftPage = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-white text-3xl font-bold mb-4">Minecraft Accounts</h1>
      <div className="bg-white rounded-2xl p-4 mb-4">
        <form
          action="/account/link"
          method="post"
          className="flex flex-col sm:flex-row sm:items-end gap-3 w-full"
        >
          <div className="flex-1">
            <Input
              name="username"
              label="Minecraft Username"
              type="text"
              placeholder="Enter your Minecraft username"
              className="flex-1"
              required
            />
          </div>
          <div>
            <Button
              type="submit"
              intent="info"
              className="w-full justify-center"
            >
              Link Account
            </Button>
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-2">
        {data.minecraftAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white shadow-sm shadow-black/25 rounded-xl p-3 flex flex-row items-center"
          >
            <div>
              <div className="flex-shrink-0 bg-slate-100 p-2 rounded-lg">
                {account.accountType === "bedrock" ? (
                  <IconMicrosoft className="w-8 h-8" />
                ) : (
                  <IconJava className="w-8 h-8" />
                )}
              </div>
              <p>
                <strong>{account.username}</strong>
              </p>
              <p>
                <small>Added: {account.createdAt}</small>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AccountLinkMinecraftPage;
