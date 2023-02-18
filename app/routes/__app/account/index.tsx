import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { db } from "~/db.server";

const AccountLinkMinecraftPage = () => {
  return (
    <>
      <h1>My Account</h1>
    </>
  );
};

export default AccountLinkMinecraftPage;
