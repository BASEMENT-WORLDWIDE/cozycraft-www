import type { UserOnboardStatus } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { auth } from "~/auth.server";
import { IconDiscord } from "~/components/IconDiscord";
import { Input } from "~/components/Input";
import { db } from "~/db.server";
import { commitSession, getSession } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const referralCode = url.searchParams.get("code");
  const user = await auth.isAuthenticated(request);

  let session = await getSession(request.headers.get("Cookie"));
  let onboardStatus: UserOnboardStatus = user?.onboardStatus ?? "welcome";
  let rulesAccepted = Boolean(session.get("rules_accepted"));

  if (user) {
    session.set(auth.sessionKey, user);
  }

  if (referralCode) {
    session.set("referral_code", referralCode);
  }

  session.set("onboard", true);

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });
  let discordName = user
    ? `${user.displayName}#${user.discordDiscriminator}`
    : null;
  let title = "Welcome to Cozycraft!";
  let description = `Cozycraft is a casual Minecraft survival experience. We're thrilled
  to have you join our community.`;
  let image = "/welcome-image-00.png";
  let imageAlt =
    "A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them.";
  if (user?.type === "guest") {
    title = "Join Cozyverse";
    description = `Thanks for linking your Discord! Additionally, you are required to join Cozyverse. Feel free to say hi!`;
  } else if (
    typeof user?.type !== "undefined" &&
    (user.type === "cozy" || user.type === "member")
  ) {
    title = "You're almost there!";
    description = `Please read over the rules of the server, we try to stay true to the spirit of the Cozyverse community.`;
  }
  if (rulesAccepted) {
    title = "Last Step";
    description = `Enter your information below, a referral is required in order to join Cozycraft.`;
  }
  return json(
    {
      onboardStatus,
      discordName,
      userType: user?.type,
      rulesAccepted,
      title,
      description,
      referralCode,
      image,
      imageAlt,
    },
    { headers }
  );
  // const { displayName, discordDiscriminator, type } =
  //   await auth.isAuthenticated(request, {
  //     failureRedirect: "/",
  //   });

  // return json({
  //   discordName,
  //   accountType: type,
  // });
};

export const action = async ({ request }: ActionArgs) => {
  let user = await auth.isAuthenticated(request, {
    failureRedirect: "/welcome",
  });
  let formData = await request.formData();
  let action = formData.get("action");
  if (action === "join") {
  } else if (action === "rules") {
  } else if (action === "create") {
  }
  return redirect("/welcome");
};

const WelcomePage = () => {
  const {
    onboardStatus,
    referralCode,
    discordName,
    userType,
    rulesAccepted,
    description,
    title,
    image,
    imageAlt,
  } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center max-w-5xl mx-5 sm:mx-auto h-full">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-12 items-center">
        <div className="col-span-full sm:col-span-7 flex flex-col h-full gap-5">
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          <p className="text-xl text-white">{description}</p>
          {typeof discordName !== "string" && (
            <Form method="post" action="/auth/discord">
              <button
                name="action"
                value="link"
                disabled={typeof userType !== "undefined"}
                className="bg-indigo-600 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <IconDiscord className="w-6 pointer-events-none" />
                Login with Discord
              </button>
            </Form>
          )}
          <Form
            method="post"
            action="/welcome"
            className="flex flex-col gap-4 w-full"
          >
            {userType === "guest" && (
              <div>
                <a
                  href="https://discord.gg/cozyverse"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Join Cozyverse
                </a>
                <button
                  name="action"
                  value="join"
                  disabled={
                    userType !== "guest" || typeof userType === "undefined"
                  }
                  className="bg-purple-600 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Recheck Status
                </button>
              </div>
            )}
            {userType !== "guest" && typeof userType !== "undefined" && (
              <div>
                <button
                  name="action"
                  value="rules"
                  className="bg-blue-500 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  I agree to the rules of Cozycraft
                </button>
              </div>
            )}
            {rulesAccepted && (
              <div className="flex flex-col gap-2">
                <div>
                  <Input name="username" label="Minecraft Username" required />
                </div>
                <div>
                  <Input
                    name="referral_code"
                    label="Referral Code"
                    required
                    defaultValue={referralCode ?? undefined}
                    disabled={typeof referralCode === "string"}
                  />
                </div>
                <button
                  name="action"
                  value="create"
                  disabled={
                    userType === "guest" || typeof userType === "undefined"
                  }
                  className="bg-green-500 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Create Account
                </button>
              </div>
            )}
          </Form>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:col-span-5">
          <img
            src={image}
            alt={imageAlt}
            width={400}
            height={400}
            className="object-cover rounded-3xl shadow-lg shadow-cyan-600/50"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
