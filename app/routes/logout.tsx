import type { ActionArgs } from "@remix-run/node";
import { auth } from "~/auth.server";

export async function action({ request }: ActionArgs) {
  await auth.logout(request, { redirectTo: "/" });
}
