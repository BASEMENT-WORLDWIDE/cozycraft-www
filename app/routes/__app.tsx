import { Form, Link, NavLink, Outlet } from "@remix-run/react";
import IconMapOutline from "@heroicons/react/24/outline/MapIcon";
import IconMapSolid from "@heroicons/react/24/solid/MapIcon";
import IconGiftOutline from "@heroicons/react/24/outline/GiftIcon";
import IconGiftSolid from "@heroicons/react/24/solid/GiftIcon";
import { ServerAddress } from "~/components/ServerAddress";
import { useOptionalUser } from "~/utils";
import { IconDiscord } from "~/components/IconDiscord";
import { IconOpenSea } from "~/components/IconOpenSea";

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
              <NavLink to="/" className="text-emerald-300">
                {({ isActive }) =>
                  isActive ? (
                    <IconMapSolid className="w-6 h-6 fill-current" />
                  ) : (
                    <IconMapOutline className="w-6 h-6 stroke-current" />
                  )
                }
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/referrals" className="text-indigo-300">
                    {({ isActive }) =>
                      isActive ? (
                        <IconGiftSolid className="w-6 h-6 fill-current" />
                      ) : (
                        <IconGiftOutline className="w-6 h-6 stroke-current" />
                      )
                    }
                  </NavLink>
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="rounded-full"
                    width={24}
                    height={24}
                  />
                </>
              ) : (
                <>
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
