import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader = async (_args: LoaderArgs) => {
  return json({ error: "Bad Request" }, { status: 400 });
};
