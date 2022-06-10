import type { LoaderFunction } from "@remix-run/node";

import { logout } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return logout({ request });
};

export default function Create() {
  return <div>Logging out</div>;
}
