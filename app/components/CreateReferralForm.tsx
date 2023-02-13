import { Button } from "./Button";
import { PlatformRadioGroup } from "./CreateReferralForm/PlatformRadioGroup";
import { Input } from "./Input";

export const CreateReferralForm = () => {
  return (
    <form action="/referrals" method="post" className="flex flex-col gap-4">
      <Input
        name="username"
        label="Minecraft Username"
        type="text"
        placeholder="Enter your friends Minecraft username"
        required
      />
      <PlatformRadioGroup />
      <div>
        <Button type="submit" intent="info" className="w-full justify-center">
          Create Referral
        </Button>
      </div>
    </form>
  );
};
