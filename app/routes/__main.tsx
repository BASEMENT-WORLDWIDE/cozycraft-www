import { Outlet } from "@remix-run/react";
import { useAccount, useConnect, useEnsName } from "wagmi";

const AppLayout = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, isLoading, error, pendingConnector } =
    useConnect();
  return (
    <>
      <nav className="w-full py-1 bg-black text-white sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <strong>Cozycraft</strong>
            <div className="ml-auto">
              {isConnected ? (
                <span>{ensName ?? address}</span>
              ) : (
                <div className="flex flex-row gap-3">
                  {connectors.map((connector) => (
                    <button
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => connect({ connector })}
                    >
                      Connect with {connector.name}
                      {!connector.ready && " (unsupported)"}
                      {isLoading &&
                        connector.id === pendingConnector?.id &&
                        " (connecting)"}
                    </button>
                  ))}

                  {error && <div>{error.message}</div>}
                </div>
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
