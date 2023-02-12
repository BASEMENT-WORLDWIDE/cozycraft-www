import clsx from "clsx";
import type { MouseEventHandler } from "react";
import { useCallback } from "react";
import GlobeAltIcon from "@heroicons/react/24/outline/GlobeAltIcon";

type ServerAddressProps = {
  address: string;
};

export const ServerAddress = ({ address }: ServerAddressProps) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    if (!navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(address);
  }, [address]);
  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "inline-flex rounded-full gap-2 bg-black bg-opacity-40 p-1 justify-center items-center text-sm",
        {
          "cursor-pointer": typeof navigator !== "undefined",
        }
      )}
    >
      <GlobeAltIcon className="w-6 h-6 pointer-events-none stroke-current" />
      <span className="pr-2">{address}</span>
    </button>
  );
};
