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
  if (!response.ok) {
    const xuid = await getXboxProfileXUID(username);
    if (!xuid) {
      return null;
    }
    return hexXUIDToMojangUUID(xUIDToHex(xuid));
  }
  const data: { id: string; name: string } = await response.json();
  return toMojangUUID(data.id);
};
