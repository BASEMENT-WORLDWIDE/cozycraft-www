import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireApiKey } from "~/api.server";

export const action = async ({ request }: ActionArgs) => {
  try {
    requireApiKey(request);
  } catch (err) {
    if (typeof err === "string") {
      return json({ error: err }, { status: 400 });
    }
    console.error(err);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
