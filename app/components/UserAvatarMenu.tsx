import { Menu, Transition } from "@headlessui/react";
import { NavLink } from "@remix-run/react";
import ExternalLinkIcon from "@heroicons/react/20/solid/ArrowTopRightOnSquareIcon";
import clsx from "clsx";
import { Fragment } from "react";
import { useUser } from "~/utils";

export const UserAvatarMenu = () => {
  const user = useUser();
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-full bg-white dark:bg-black text-gray-700 shadow-sm hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="rounded-full object-cover"
            width={32}
            height={32}
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-3xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-6 py-5">
            <p className="text-gray-700">Signed in as</p>
            <p className="truncate font-medium text-gray-900">
              {`${user.displayName}#${user.discordDiscriminator}`}
            </p>
          </div>
          <div>
            {user.type === "guest" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="https://opensea.io/collection/cozy-penguin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      active
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700",
                      "block px-5 py-3"
                    )}
                  >
                    Upgrade to Cozy
                  </a>
                )}
              </Menu.Item>
            )}
            {user.type === "cozy" && (
              <Menu.Item as="div">
                {({ active }) => (
                  <NavLink
                    to="referrals"
                    className={({ isActive }) =>
                      clsx("block px-5 py-3", {
                        "bg-gray-100 text-gray-900 font-medium":
                          active || isActive,
                        "text-gray-700": !active && !isActive,
                      })
                    }
                  >
                    My Referrals
                  </NavLink>
                )}
              </Menu.Item>
            )}
            <Menu.Item as="div">
              {({ active }) => (
                <NavLink
                  to="/account/link"
                  className={({ isActive }) =>
                    clsx("block px-5 py-3", {
                      "bg-gray-100 text-gray-900 font-medium":
                        active || isActive,
                      "text-gray-700": !active && !isActive,
                    })
                  }
                >
                  Link Minecraft Accounts
                </NavLink>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="https://discord.com/invite/cozyverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-5 py-3"
                  )}
                >
                  Join Discord{" "}
                  <ExternalLinkIcon className="fill-gray-700 w-5 h-5 inline-block align-text-top" />
                </a>
              )}
            </Menu.Item>
          </div>
          <div>
            <form method="POST" action="/logout">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    className={clsx(
                      active
                        ? "bg-gray-100 text-gray-900 rounded-b-3xl"
                        : "text-gray-700",
                      "block w-full px-5 py-3 text-left"
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </form>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
