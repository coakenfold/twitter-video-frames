import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { userPrefs, userPrefsDefault } from "~/cookies";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export interface LogoutInput {
  request: Request;
  url?: string;
  shouldDeleteUserPrefs?: boolean;
}
export async function logout({
  request,
  url = "/tvf",
  shouldDeleteUserPrefs = false,
}: LogoutInput) {
  const session = await getUserSession(request);
  const headers = new Headers();
  headers.append("Set-Cookie", await sessionStorage.destroySession(session));
  if (shouldDeleteUserPrefs) {
    headers.append("Set-Cookie", await userPrefs.serialize(userPrefsDefault));
  }

  // "Set-Cookie": await userPrefs.serialize(cookie),
  return redirect(url, {
    headers,
  });
}
