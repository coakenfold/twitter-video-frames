import { createCookie } from "@remix-run/node";

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week
});

export interface UserPrefs {
  canRequestEmail: boolean;
}
export const userPrefsDefault = {
  canRequestEmail: true,
};
export const getUserPrefs = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || userPrefsDefault;
  return cookie as UserPrefs;
};
