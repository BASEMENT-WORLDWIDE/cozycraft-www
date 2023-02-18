import { toMojangUUID } from "./utils";
import {
  getXboxProfileXUID,
  hexXUIDToMojangUUID,
  xUIDToHex,
} from "./xbox.server";

export const getMojangUUID = async (username: string) => {
  const response = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${username}`
  );
  const NO_CONTENT_RESPONSE = response.status === 204;
  if (!response.ok || NO_CONTENT_RESPONSE) {
    const xuid = await getXboxProfileXUID(username);
    if (!xuid) {
      throw `Player "${username}" does not exist.`;
    }
    return [hexXUIDToMojangUUID(xUIDToHex(xuid)), "bedrock"] as const;
  }
  const data: { id: string; name: string } = await response.json();
  return [toMojangUUID(data.id), "java"] as const;
};
