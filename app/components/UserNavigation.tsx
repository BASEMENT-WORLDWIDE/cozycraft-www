import type { User } from "@prisma/client";
import { NavLink } from "@remix-run/react";
import IconGiftOutline from "@heroicons/react/24/outline/GiftIcon";
import IconGiftSolid from "@heroicons/react/24/solid/GiftIcon";
import IconMapOutline from "@heroicons/react/24/outline/MapIcon";
import IconMapSolid from "@heroicons/react/24/solid/MapIcon";
import { IconOpenSea } from "./IconOpenSea";

type UserNavigationProps = {
  user: Pick<User, "type" | "avatar" | "displayName">;
};

export const UserNavigation = ({ user }: UserNavigationProps) => {
  return (
    <>
      {user.type === "guest" && (
        <a
          href="https://opensea.io/collection/cozy-penguin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cozyverse OpenSea"
          className="bg-gold-300 rounded-full inline-flex items-center p-1 gap-2"
        >
          <IconOpenSea className="w-8 h-8" />{" "}
          <span className="pr-2 text-sm font-semibold">Upgrade to Cozy</span>
        </a>
      )}
      <NavLink to="/" className="text-emerald-300">
        {({ isActive }) =>
          isActive ? (
            <IconMapSolid className="w-8 h-8 fill-current" />
          ) : (
            <IconMapOutline className="w-8 h-8 stroke-current" />
          )
        }
      </NavLink>
      {user.type === "cozy" && (
        <NavLink to="/referrals" className="text-indigo-300">
          {({ isActive }) =>
            isActive ? (
              <IconGiftSolid className="w-8 h-8 fill-current" />
            ) : (
              <IconGiftOutline className="w-8 h-8 stroke-current" />
            )
          }
        </NavLink>
      )}
      <img
        src={user.avatar}
        alt={user.displayName}
        className="rounded-full"
        width={32}
        height={32}
      />
    </>
  );
};
