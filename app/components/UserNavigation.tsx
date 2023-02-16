import type { User } from "@prisma/client";
import { NavLink } from "@remix-run/react";
import IconGiftOutline from "@heroicons/react/24/outline/GiftIcon";
import IconGiftSolid from "@heroicons/react/24/solid/GiftIcon";
import IconMapOutline from "@heroicons/react/24/outline/MapIcon";
import IconMapSolid from "@heroicons/react/24/solid/MapIcon";
import { IconOpenSea } from "./IconOpenSea";
import { UserAvatarMenu } from "./UserAvatarMenu";
import clsx from "clsx";

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
      <NavLink to="account">
        {({ isActive }) => (
          <img
            src={user.avatar}
            alt={user.displayName}
            className={clsx("rounded-full object-cover", {
              "rounded-full bg-white dark:bg-black text-gray-700 shadow-sm hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100":
                isActive,
            })}
            width={32}
            height={32}
          />
        )}
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
      <div className="hidden sm:block">
        <UserAvatarMenu />
      </div>
    </>
  );
};
