import IconMapOutline from "@heroicons/react/24/outline/MapIcon";
import IconMapSolid from "@heroicons/react/24/solid/MapIcon";
import { IconDiscord } from "~/components/IconDiscord";
import { IconOpenSea } from "~/components/IconOpenSea";
import { Form, NavLink } from "@remix-run/react";

export const DefaultNavigation = () => {
  return (
    <>
      <NavLink to="/" className="text-emerald-300">
        {({ isActive }) =>
          isActive ? (
            <IconMapSolid className="w-8 h-8 fill-current" />
          ) : (
            <IconMapOutline className="w-8 h-8 stroke-current" />
          )
        }
      </NavLink>
      {/* <a
        href="https://discord.com/invite/cozyverse"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cozyverse Discord"
      >
        <IconDiscord className="h-8" />
      </a>
      <a
        href="https://opensea.io/collection/cozy-penguin"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cozyverse OpenSea"
      >
        <IconOpenSea className="w-8 h-8" />
      </a> */}
      <Form action="/auth/discord" method="post">
        <button className="bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-800 transition-colors shadow-sm font-semibold shadow-purple-900">
          Login with Discord
        </button>
      </Form>
    </>
  );
};
