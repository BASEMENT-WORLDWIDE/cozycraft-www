import { Form, Link, Outlet } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

const AppLayout = () => {
  const user = useOptionalUser();
  return (
    <>
      <nav className="w-full py-1 bg-black text-white sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <strong>
              <Link to="/">Cozycraft</Link>
            </strong>
            <div className="ml-auto">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/referrals">My Referrals</Link>
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="rounded-full"
                    width={24}
                    height={24}
                  />
                  <span>{user.displayName}</span>
                </div>
              ) : (
                <Form action="/auth/discord" method="post">
                  <button>Login with Discord</button>
                </Form>
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
