import invariant from "tiny-invariant";
import {
  authenticate,
  type CredentialsAuthenticateInitialResponse,
} from "@xboxreplay/xboxlive-auth";
import { getPlayerXUID } from "@xboxreplay/xboxlive-api";
import { DateTime } from "luxon";
import { toMojangUUID } from "./utils.server";

const clientId = process.env.MSFT_APP_ID;
const clientSecret = process.env.MSFT_APP_SECRET;
const msftEmailAddress = process.env.MSFT_EMAIL;
const msftPassword = process.env.MSFT_PWD;

invariant(clientId, "MSFT_APP_ID does not exist.");
invariant(clientSecret, "MSFT_APP_SECRET does not exist.");
invariant(msftEmailAddress, "MSFT_EMAIL does not exist.");
invariant(msftPassword, "MSFT_PWD does not exist.");

let XSTSToken: string | undefined;
let userHash: string | undefined;
let expiry: string | undefined;

const assignTokens = async () => {
  const response = await authenticate(msftEmailAddress, msftPassword);
  return response as CredentialsAuthenticateInitialResponse;
};

export const getXboxProfileXUID = async (gamertag: string) => {
  try {
    if (
      !XSTSToken ||
      !userHash ||
      (typeof expiry === "string" && DateTime.now() > DateTime.fromISO(expiry))
    ) {
      const tokens = await assignTokens();
      XSTSToken = tokens.xsts_token;
      userHash = tokens.user_hash;
      expiry = tokens.expires_on;
    }
    const xuid = await getPlayerXUID(gamertag, {
      userHash,
      XSTSToken,
    });
    return xuid;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const xUIDToHex = (xuid: string) => Number(xuid).toString(16);
export const hexXUIDToMojangUUID = (hexXUID: string) =>
  toMojangUUID(`0000000000000000${hexXUID}`);
