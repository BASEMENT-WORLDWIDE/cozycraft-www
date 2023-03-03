import type { UserOnboardStatus } from "@prisma/client";

export type OnboardStep = {
  id: UserOnboardStatus;
  title: string;
  body: string;
  image: {
    src: string;
    alt: string;
  };
};

export const onboardStep: Record<
  Exclude<UserOnboardStatus, "finish">,
  OnboardStep
> = {
  start: {
    id: "start",
    title: "Welcome to Cozycraft!",
    body: `Cozycraft is a casual Minecraft survival experience. We're thrilled
        to have you join our community.`,
    image: {
      src: "/welcome-image-00.png",
      alt: "A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them.",
    },
  },
  link_discord: {
    id: "link_discord",
    title: "Join Cozyverse",
    body: `Thanks for linking your Discord! Additionally, you are required to join Cozyverse. Feel free to say hi!`,
    image: {
      src: "/welcome-image-00.png",
      alt: "A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them.",
    },
  },
  join_discord: {
    id: "join_discord",
    title: "You're almost there!",
    body: `Please read over the rules of the server, we try to stay true to the spirit of the Cozyverse community.`,
    image: {
      src: "/welcome-image-00.png",
      alt: "A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them.",
    },
  },
  accept_rules: {
    id: "accept_rules",
    title: "Last Step",
    body: `Enter your information below, a referral is required in order to join Cozycraft.`,
    image: {
      src: "/welcome-image-00.png",
      alt: "A blocky penguin standing on blocky island holding a sword above its head with a determined look on its face. In the background there are castles and a warm radiant watercolor-esque glow behind them.",
    },
  },
};
