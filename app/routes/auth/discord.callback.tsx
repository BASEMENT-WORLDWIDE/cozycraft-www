import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { auth } from "~/auth.server";
import { commitSession, getSession } from "~/session.server";
import { isOnboarded } from "~/user.server";

export let loader = async ({ request }: LoaderArgs) => {
  let session = await getSession(request.headers.get("Cookie"));
  let referralCode = session.get("referral_code");
  let user = await auth.authenticate("discord", request, {
    context: {
      referralCode,
    },
  });

  session.set(auth.sessionKey, user);

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  if (isOnboarded(user)) {
    return redirect("/", { headers });
  }

  return redirect("/welcome", { headers });
};
