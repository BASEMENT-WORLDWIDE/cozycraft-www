import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { WagmiConfig } from "wagmi";
import styles from "./styles/app.css";
import { wagmiClient } from "./wagmi";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Cozycraft",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <WagmiConfig client={wagmiClient}>
          <Outlet />
        </WagmiConfig>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script>{`var global = global || window;`}</script>
      </body>
    </html>
  );
}
