import { RCON } from "minecraft-server-util";
import invariant from "tiny-invariant";

const RCON_PASSWORD = process.env.RCON_PASSWORD;

invariant(RCON_PASSWORD, "RCON_PASSWORD not set.");

const client = new RCON();

const DEFAULT_TIMEOUT = 1000 * 5;

export const addToRuntimeWhitelist = async (username: string) => {
  await client.connect("cozycraft.fly.dev", 25575, {
    timeout: DEFAULT_TIMEOUT,
  });
  await client.login(RCON_PASSWORD, { timeout: DEFAULT_TIMEOUT });
  await client.run(`whitelist add ${username}`);
};
