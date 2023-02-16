import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { auth } from "~/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request);
};
export const action = async ({ request }: ActionArgs) => {};

const SuggestionsPage = () => {
  return <h1>Suggestions</h1>;
};

export default SuggestionsPage;
