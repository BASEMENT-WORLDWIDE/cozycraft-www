import IconGiftOutline from "@heroicons/react/24/outline/GiftIcon";
import IconMapOutline from "@heroicons/react/24/outline/MapIcon";
import IconGiftSolid from "@heroicons/react/24/solid/GiftIcon";
import IconMapSolid from "@heroicons/react/24/solid/MapIcon";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";
import { IconDiscord } from "~/components/IconDiscord";
import { IconOpenSea } from "~/components/IconOpenSea";
import { ServerAddress } from "~/components/ServerAddress";
import { useOptionalUser } from "~/utils";

const AppLayout = () => {
  const user = useOptionalUser();
  return (
    <>
      <nav className="w-full py-4 text-white sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <strong>
              <Link to="/">
                <img src="/logo.png" alt="Cozycraft" width={163} height={32} />
              </Link>
            </strong>
            <div className="ml-auto flex items-center gap-3">
              <ServerAddress address="cozycraft.fun" />
              {user ? (
                <>
                  {user.type === "guest" && (
                    <a
                      href="https://opensea.io/collection/cozy-penguin"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Cozyverse OpenSea"
                      className="bg-gold-300 rounded-full inline-flex items-center p-1 gap-2"
                    >
                      <IconOpenSea className="w-6 h-6" />{" "}
                      <span className="pr-2 text-sm font-semibold">
                        Upgrade to Cozy
                      </span>
                    </a>
                  )}
                  <NavLink to="/" className="text-emerald-300">
                    {({ isActive }) =>
                      isActive ? (
                        <IconMapSolid className="w-6 h-6 fill-current" />
                      ) : (
                        <IconMapOutline className="w-6 h-6 stroke-current" />
                      )
                    }
                  </NavLink>
                  {user.type === "cozy" && (
                    <NavLink to="/referrals" className="text-indigo-300">
                      {({ isActive }) =>
                        isActive ? (
                          <IconGiftSolid className="w-6 h-6 fill-current" />
                        ) : (
                          <IconGiftOutline className="w-6 h-6 stroke-current" />
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto pt-8">
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;
