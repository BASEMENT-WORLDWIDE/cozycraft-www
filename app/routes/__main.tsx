import { Outlet } from "@remix-run/react";
import { useAccount, useConnect, useEnsName } from "wagmi";

const AppLayout = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, isLoading, error, pendingConnector } =
    useConnect();
  return (
    <div>
      <nav>
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
      </nav>
      <Outlet />
    </div>
  );
};

export default AppLayout;
