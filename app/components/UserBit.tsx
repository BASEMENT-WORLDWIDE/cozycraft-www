type UserBitProps = {
  avatar: string;
  username: string;
};

export const UserBit = ({ avatar, username }: UserBitProps) => {
  return (
    <span className="inline-flex flex-row items-center gap-2 px-2 py-px bg-black/20 align-middle mr-1 rounded-md shadow-sm shadow-black/10 whitespace-nowrap">
      <img
        src={avatar}
        alt={`${username} avatar`}
        width={24}
        height={24}
        className="object-cover rounded-full"
      />
      <strong className="font-semibold">{username}</strong>
    </span>
  );
};
