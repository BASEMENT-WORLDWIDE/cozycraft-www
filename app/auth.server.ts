import type { DiscordProfile } from "remix-auth-discord";
import type { User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import invariant from "tiny-invariant";
import { sessionStorage } from "~/session.server";
import { db } from "./db.server";
import humanId from "human-id";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_CALLBACK_URL = process.env.DISCORD_CALLBACK_URL;

const COZYVERSE_GUILD_ID = "929919596419502111";
const COZYVERSE_HOLDER_ROLE_ID = "929919596419502113";

invariant(DISCORD_CLIENT_ID, "DISCORD_CLIENT_ID not set.");
invariant(DISCORD_CLIENT_SECRET, "DISCORD_CLIENT_SECRET not set.");
invariant(DISCORD_CALLBACK_URL, "DISCORD_CALLBACK_URL not set.");

type CozyMember = {
  avatar?: string;
  communication_disabled_until: string;
  flags: number;
  is_pending: boolean;
  joined_at: string;
  nick?: string;
  pending: boolean;
  premium_since: string | null;
  roles: string[];
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar: string;
    avatar_decoration: string | null;
    discriminator: string;
    public_flags: number;
  };
  mute: boolean;
  deaf: boolean;
};

export type DiscordUser = {
  id: DiscordProfile["id"];
  displayName: DiscordProfile["displayName"];
  avatar: DiscordProfile["__json"]["avatar"];
  discriminator: DiscordProfile["__json"]["discriminator"];
  email: DiscordProfile["__json"]["email"];
  // guilds?: Array<PartialDiscordGuild>;
  accessToken: string;
  refreshToken: string;
};

export type SessionUser = Pick<
  User,
  | "id"
  | "displayName"
  | "avatar"
  | "type"
  | "discordDiscriminator"
  | "onboardStatus"
>;

export let auth = new Authenticator<SessionUser>(sessionStorage);

const discordStrategy = new DiscordStrategy(
  {
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_CALLBACK_URL,
    // Provide all the scopes you want as an array
    scope: ["identify", "email", "guilds", "guilds.members.read"],
  },
  async ({
    accessToken,
    refreshToken,
    extraParams,
    context,
    profile,
  }): Promise<SessionUser> => {
    let cozyverseMember: CozyMember | null = null;
    let isCozyHolder = false;

    try {
      /**
       * Get the user data from your DB or API using the tokens and profile
       * For example query all the user guilds
       * IMPORTANT: This can quickly fill the session storage to be too big.
       * So make sure you only return the values from the guilds (and the guilds) you actually need
       * (eg. omit the features)
       * and if that's still to big, you need to store the guilds some other way. (Your own DB)
       *
       * Either way, this is how you could retrieve the user guilds.
       */
      const response = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${COZYVERSE_GUILD_ID}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const message = await response.text();
        throw Error(message);
      }
      cozyverseMember = (await response.json()) as CozyMember | null;
      if (cozyverseMember) {
        isCozyHolder = cozyverseMember.roles.includes(COZYVERSE_HOLDER_ROLE_ID);
      }
    } catch (err) {
      console.log(err);
    }

    const getUserAvatar = () => {
      if (cozyverseMember?.avatar) {
        return `https://cdn.discordapp.com/guilds/${COZYVERSE_GUILD_ID}/users/${profile.id}/avatars/${cozyverseMember.avatar}.jpg`;
      } else if (profile.__json.avatar) {
        return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}`;
      }
      return `https://cdn.discordapp.com/embed/avatars/${profile.__json.discriminator}.png`;
    };

    const avatar = getUserAvatar();
    const userType = isCozyHolder
      ? "cozy"
      : cozyverseMember
      ? "member"
      : "guest";
    const referralCode = context?.referralCode as string | undefined;

    const user = await db.user.upsert({
      where: {
        id: profile.id,
      },
      create: {
        id: profile.id,
        avatar,
        discordDiscriminator: profile.__json.discriminator,
        displayName: cozyverseMember?.nick ?? profile.__json.username,
        email: profile.__json.email,
        onboardStatus: isCozyHolder ? "join_discord" : "link_discord",
        status: referralCode ? "active" : "inactive",
        referredBy: referralCode
          ? {
              connect: {
                referralCode,
              },
            }
          : undefined,
        discordAccessToken: accessToken,
        discordRefreshToken: refreshToken,
        referralCode: humanId({
          separator: "-",
        }),
        type: userType,
      },
      update: {
        avatar,
        discordDiscriminator: profile.__json.discriminator,
        displayName: cozyverseMember?.nick ?? profile.__json.username,
        email: profile.__json.email,
        type: userType,
      },
    });

    /**
     * Construct the user profile to your liking by adding data you fetched etc.
     * and only returning the data that you actually need for your application.
     */
    return {
      id: user.id,
      avatar: user.avatar,
      displayName: user.displayName,
      type: user.type,
      discordDiscriminator: user.discordDiscriminator,
      onboardStatus: user.onboardStatus,
    };
  }
);

auth.use(discordStrategy);
