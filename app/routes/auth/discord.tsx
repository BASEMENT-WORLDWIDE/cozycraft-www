import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { auth } from "~/auth.server";

export let loader = () => redirect("/");
export let action = ({ request }: ActionArgs) => {
  const url = new URL(request.url);
  const isOnboarding = url.searchParams.get("onboard");

  if (isOnboarding) {
    return auth.authenticate("discord", request, {
      successRedirect: "/welcome",
    });
  }

  return auth.authenticate("discord", request);
};
