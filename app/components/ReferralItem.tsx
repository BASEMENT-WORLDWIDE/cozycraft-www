type ReferralItemProps = {
  displayName: string;
  joinDate: string;
  discriminator: string;
};

export const ReferralItem = ({
  displayName,
  discriminator,
}: ReferralItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">
          {displayName}
          <span>{`#${discriminator}`}</span>
        </p>
      </div>
      <div></div>
    </div>
  );
};
