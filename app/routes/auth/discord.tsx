import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { auth } from "~/auth.server";

export let loader = () => redirect("/");
export let action = ({ request }: ActionArgs) =>
  auth.authenticate("discord", request);
