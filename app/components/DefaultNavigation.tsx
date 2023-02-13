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
            <IconMapSolid className="w-6 h-6 fill-current" />
          ) : (
            <IconMapOutline className="w-6 h-6 stroke-current" />
          )
        }
      </NavLink>
      <a
        href="https://discord.com/invite/cozyverse"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cozyverse Discord"
      >
        <IconDiscord className="h-6" />
      </a>
      <a
        href="https://opensea.io/collection/cozy-penguin"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cozyverse OpenSea"
      >
        <IconOpenSea className="w-6 h-6" />
      </a>
      <Form action="/auth/discord" method="post">
        <button>Login with Discord</button>
      </Form>
    </>
  );
};
