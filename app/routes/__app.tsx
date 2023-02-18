import { Link, Outlet } from "@remix-run/react";
import { DefaultNavigation } from "~/components/DefaultNavigation";
import { ServerAddress } from "~/components/ServerAddress";
import { UserNavigation } from "~/components/UserNavigation";
import { useOptionalUser } from "~/utils";

const AppLayout = () => {
  const user = useOptionalUser();
  return (
    <>
      <nav className="hidden sm:block w-full py-4 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="Cozycraft" width={203.75} height={40} />
            </Link>
            <div className="ml-auto flex items-center gap-6">
              <ServerAddress address="cozycraft.fun" />
              {user ? <UserNavigation user={user} /> : <DefaultNavigation />}
            </div>
          </div>
        </div>
      </nav>
      <div className="sm:hidden flex items-center w-full justify-center py-4">
        <Link to="/">
          <img src="/logo.png" alt="Cozycraft" width={163} height={32} />
        </Link>
      </div>
      <div className="max-w-7xl mx-auto pt-8 mb-16">
        <Outlet />
      </div>
      <nav className="block sm:hidden fixed bottom-0 w-full">
        <div className="p-4 bg-black flex flex-row items-center gap-5 justify-around">
          {user ? <UserNavigation user={user} /> : <DefaultNavigation />}
        </div>
      </nav>
    </>
  );
};

export default AppLayout;
