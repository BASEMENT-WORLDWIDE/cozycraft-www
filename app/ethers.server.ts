import { utils } from "ethers";

export const verifySignature = (message: string, signature: string) => {
  return utils.recoverAddress(utils.hashMessage(message), signature);
};
