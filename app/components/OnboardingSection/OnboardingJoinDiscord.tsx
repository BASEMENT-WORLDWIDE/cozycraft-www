import { OnboardingSection } from "../OnboardingSection";

type OnboardingJoinDiscordProps = {
  discordName?: string;
};

export const OnboardingJoinDiscord = ({
  discordName,
}: OnboardingJoinDiscordProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-12 items-center">
      <div className="col-span-full sm:col-span-7 flex flex-col h-full gap-5">
        <OnboardingSection title={<>Step 1/2: Join the Cozyverse!</>}>
          <p className="text-xl">
            In order to play cozycraft and be assigned the appropriate
            permissions if you are a Cozy Penguin holder, you should join the
            Cozyverse Discord!
          </p>
          <form
            method="post"
            action="/welcome"
            className="flex flex-col gap-2 w-full mt-auto"
          >
            <div>
              <button
                type="submit"
                name="action"
                value="join_success"
                className="bg-lime-400 text-lime-800 rounded-2xl w-full font-semibold py-3 text-xl hover:bg-lime-600 transition-all hover:text-lime-900 shadow-sm shadow-lime-900/20"
              >
                I&apos;ve joined Cozyverse
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
  );
};
