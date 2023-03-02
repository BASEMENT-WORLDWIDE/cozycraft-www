import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { auth } from "~/auth.server";
import { getSession } from "~/session.server";

export let loader = () => redirect("/");
export let action = ({ request }: ActionArgs) => {
  return auth.authenticate("discord", request);
};
