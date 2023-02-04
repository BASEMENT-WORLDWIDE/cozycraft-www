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
          {isConnected ? (
            <span>{ensName ?? address}</span>
          ) : (
            <>
              {connectors.map((connector) => (
                <button
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect({ connector })}
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                  {isLoading &&
                    connector.id === pendingConnector?.id &&
                    " (connecting)"}
                </button>
              ))}

              {error && <div>{error.message}</div>}
            </>
          )}
        </div>
      </nav>
      <div className="max-w-7xl mx-auto pt-8">
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;
