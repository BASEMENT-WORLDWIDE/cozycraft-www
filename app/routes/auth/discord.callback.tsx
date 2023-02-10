import type { LoaderArgs } from "@remix-run/node";
import { auth } from "~/auth.server";

export let loader = ({ request }: LoaderArgs) =>
  auth.authenticate("discord", request, {
    successRedirect: "/",
    failureRedirect: "/",
  });
