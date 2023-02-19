import { Transition } from "@headlessui/react";
import type { UserOnboardStatus } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { auth } from "~/auth.server";
import { OnboardingSection } from "~/components/OnboardingSection";
import { db } from "~/db.server";
import { getSession } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const { displayName, discordDiscriminator, type } =
    await auth.isAuthenticated(request, {
      failureRedirect: "/",
    });
  const discordName = `${displayName}#${discordDiscriminator}`;

  return json({
    discordName,
    accountType: type,
  });
};

const WelcomePage = () => {
  const { discordName, accountType } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4 items-center justify-center text-white max-w-5xl mx-5 sm:mx-auto h-full">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-12 items-center">
        <div className="col-span-full sm:col-span-7 flex flex-col h-full gap-5">
          <OnboardingSection
            title={
              <>
                Hey there{" "}
                <span className="font-semibold whitespace-nowrap">
                  {discordName}
                </span>
                !
              </>
            }
          >
            <p className="text-xl">
              Welcome to Cozycraft, a casual Minecraft survival experience.
              We're thrilled to have you join our community.
            </p>
            <form
              method="post"
              action="/welcome"
              className="flex flex-col gap-2 w-full mt-auto"
            >
              <div>
                <button
                  type="button"
                  className="bg-lime-400 text-lime-800 rounded-2xl w-full font-semibold py-3 text-xl hover:bg-lime-600 transition-all hover:text-lime-900 shadow-sm shadow-lime-900/20"
                >
                  Get Started
                </button>
              </div>
            </form>
          </OnboardingSection>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:col-span-5">
          <img
            src="/welcome-image-00.png"
            alt="A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them."
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
