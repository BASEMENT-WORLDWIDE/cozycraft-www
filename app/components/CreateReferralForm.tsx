import { Button } from "./Button";
import { Input } from "./Input";

export const CreateReferralForm = () => {
  return (
    <form
      action="/referrals"
      method="post"
      className="flex flex-col sm:flex-row sm:items-end gap-3 w-full"
    >
      <div className="flex-1">
        <Input
          name="username"
          label="Minecraft Username"
          type="text"
          placeholder="Enter your friends Minecraft username"
          className="flex-1"
          required
        />
      </div>
      <div>
        <Button type="submit" intent="info" className="w-full justify-center">
          Create Referral
        </Button>
      </div>
    </form>
  );
};
