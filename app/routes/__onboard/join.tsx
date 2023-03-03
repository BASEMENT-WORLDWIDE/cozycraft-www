import type { UserOnboardStatus } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { auth } from "~/auth.server";
import { DelayedButton } from "~/components/DelayedButton";
import { IconDiscord } from "~/components/IconDiscord";
import { Input } from "~/components/Input";
import { db } from "~/db.server";
import { getMojangUUID } from "~/mojang";
import { onboardStep } from "~/onboarding.server";
import { commitSession, getSession } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const referralCode = url.searchParams.get("code");
  const user = await auth.isAuthenticated(request);

  let session = await getSession(request.headers.get("Cookie"));
  let onboardStatus: UserOnboardStatus = user?.onboardStatus ?? "start";
  let userType = user?.type ?? "guest";

  if (onboardStatus === "finish") {
    return redirect("/");
  }

  if (user) {
    session.set(auth.sessionKey, user);
  }

  if (referralCode) {
    session.set("referral_code", referralCode);
  }

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });
  let step = onboardStep[onboardStatus];

  return json(
    {
      referralCode,
      userType,
      step,
    },
    { headers }
  );
};

export const action = async ({ request }: ActionArgs) => {
  let user = await auth.isAuthenticated(request, {
    failureRedirect: "/join",
  });
  let headers: Headers;
  let session = await getSession(request.headers.get("Cookie"));
  let formData = await request.formData();
  let action = formData.get("action");
  let username = formData.get("username");
  let referralCode = formData.get("referral_code");
  if (action === "join") {
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        onboardStatus: "join_discord",
      },
    });
    user.onboardStatus = "join_discord";
  } else if (action === "rules") {
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        onboardStatus: "accept_rules",
      },
    });
    user.onboardStatus = "accept_rules";
  } else if (action === "create") {
    if (typeof referralCode !== "string") {
      session.flash(
        "no_referral_code",
        "A valid referral code was not provided."
      );
      headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return redirect("/join", { headers });
    }
    if (typeof username !== "string") {
      session.flash("no_username", "Username was not provided.");
      headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return redirect("/join", { headers });
    }
    try {
      let [mojangUUID, accountType] = await getMojangUUID(username);
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          onboardStatus: "finish",
          status: "active",
          role: "player",
          referredBy: {
            connect: {
              referralCode,
            },
          },
          minecraftAccounts: {
            create: {
              username: accountType === "bedrock" ? `.${username}` : username,
              mojangUUID,
              accountType,
              status: "active",
              role: "player",
            },
          },
        },
      });
      user.onboardStatus = "finish";
      session.set(auth.sessionKey, user);
      headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return redirect("/", { headers });
    } catch (err) {
      if (err instanceof String) {
        session.flash(
          "no_minecraft_account",
          `The minecraft account provided does not exist. If you're using Bedrock, please make sure it is your Gamertag, otherwise check for spelling. If the problem persists, please post in the #cozycraft Discord channel.`
        );
      }
      headers = new Headers({ "Set-Cookie": await commitSession(session) });
      return redirect("/join", { headers });
    }
  }
  session.set(auth.sessionKey, user);
  headers = new Headers({ "Set-Cookie": await commitSession(session) });
  return redirect("/join", { headers });
};

const WelcomePage = () => {
  const { step, referralCode, userType } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center max-w-5xl mx-5 sm:mx-auto h-full">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-12 items-center">
        <div className="col-span-full sm:col-span-7 flex flex-col h-full gap-5">
          <h1 className="text-3xl font-semibold text-white">{step.title}</h1>
          <p className="text-xl text-white">{step.body}</p>
          {step.id === "start" && (
            <Form method="post" action="/auth/discord">
              <button
                name="action"
                value="link"
                className="bg-indigo-600 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <IconDiscord className="w-6 pointer-events-none" />
                Login with Discord
              </button>
            </Form>
          )}
          <Form
            method="post"
            action="/join"
            className="flex flex-col gap-4 w-full"
          >
            {step.id === "link_discord" && userType === "guest" && (
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
                  className="bg-purple-600 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Recheck Status
                </button>
              </div>
            )}
            {step.id === "join_discord" && userType !== "guest" && (
              <>
                <ol className="text-white list-inside list-decimal space-y-3 text-justify">
                  <li>
                    <strong>Be Respectful</strong>&nbsp;&mdash;&nbsp;Don&apos;t
                    grief peoples creations, and people in general. If
                    you&apos;re unsure about something, just post in the{" "}
                    <span>#cozycraft</span> channel.
                  </li>
                  <li>
                    <strong>No Hacking or Cheating</strong>
                    &nbsp;&mdash;&nbsp;Any form of hacking or cheating is
                    strictly prohibited. This includes using mods, clients, or
                    any other software that gives you an unfair advantage over
                    other players.
                  </li>
                  <li>
                    <strong>No Spamming or Advertising</strong>
                    &nbsp;&mdash;&nbsp;Do not spam the chat or advertise other
                    servers or websites. This is considered disruptive behavior
                    and can result in a ban.
                  </li>
                  <li>
                    <strong>Keep the Server Clean</strong>&nbsp;&mdash;&nbsp;Do
                    not litter the world with unnecessary blocks or structures.
                    If you build something, make sure it is aesthetically
                    pleasing and fits in with the surrounding environment.
                  </li>
                  <li>
                    <strong>No Stealing or Scamming</strong>
                    &nbsp;&mdash;&nbsp;Do not steal from other players or scam
                    them out of their resources. This includes taking items from
                    unprotected chests or deceiving others in trade
                    transactions. Players found guilty of stealing or scamming
                    will be punished accordingly.
                  </li>
                </ol>
                <div>
                  <DelayedButton
                    waitFor={5000}
                    name="action"
                    value="rules"
                    className="bg-blue-500 text-white rounded-lg w-full flex items-center justify-center gap-2 font-semibold py-3 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {({ count, isRunning }) => (
                      <>
                        I agree to the rules of Cozycraft{" "}
                        {isRunning && `(${count})`}
                      </>
                    )}
                  </DelayedButton>
                </div>
              </>
            )}
            {step.id === "accept_rules" && (
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
            src={step.image.src}
            alt={step.image.alt}
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
