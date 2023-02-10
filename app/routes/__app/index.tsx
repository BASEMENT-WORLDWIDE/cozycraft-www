import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const success = url.searchParams.get("success");

  return json({
    message:
      success === "true"
        ? "Welcome to Cozycraft! The IP address is: cozycraft.fly.dev"
        : null,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1 className="font-semibold">Cozycraft</h1>
      {data.message && <h2 className="font-medium">{data.message}</h2>}
    </div>
  );
}
