import { Authenticator } from "remix-auth";
import { TwitterStrategy } from "remix-auth-twitter";
import { sessionStorage } from "~/session.server";
import invariant from "tiny-invariant";
import {
  getUserByPlatformId,
  createUser,
  updateUserEmail,
} from "~/models/user.server";
import {
  createAccountWithPlatformId,
  getAccountByPlatformId,
} from "~/models/account.server";
import { getUserPrefs } from "~/cookies";

invariant(process.env.PLATFORM_CLIENT_ID, "Missing PLATFORM_CLIENT_ID env");
invariant(
  process.env.PLATFORM_CLIENT_SECRET,
  "Missing PLATFORM_CLIENT_SECRET env"
);
invariant(
  process.env.PLATFORM_CALLBACK_URL,
  "Missing PLATFORM_CALLBACK_URL env"
);

export const authentication = async (request: Request) => {
  const cookie = await getUserPrefs(request);

  // See https://developer.spotify.com/documentation/general/guides/authorization/scopes
  const scopes = [
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
  ];

  if (cookie.canRequestEmail) {
    scopes.push("user-read-email");
  }

  const platformStrategy = new TwitterStrategy(
    {
      clientID: process.env.PLATFORM_CLIENT_ID as string,
      clientSecret: process.env.PLATFORM_CLIENT_SECRET as string,
      callbackURL: process.env.PLATFORM_CALLBACK_URL as string,
      sessionStorage,
      scope: scopes.join(" "),
    },
    async ({ accessToken, refreshToken, extraParams, profile }) => {
      // Get/Create user
      let user = await getUserByPlatformId(profile.id);
      if (!user) {
        user = await createUser({
          email: profile?.__json?.email,
          displayName: profile.displayName,
          platformId: profile.id,
        });
      } else {
        user = await updateUserEmail({
          email: profile?.__json?.email,
          platformId: profile.id,
        });
      }
      // Get/Create account
      let account = await getAccountByPlatformId(profile.id);
      if (!account) {
        account = await createAccountWithPlatformId({
          platformId: profile.id,
          preferences: { newsletter: true },
        });
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + extraParams.expiresIn * 1000,
        tokenType: extraParams.tokenType,
        user: {
          id: user ? user.platformId : "",
          email: user ? user.email : "",
          name: user ? user.displayName : "",
        },
      };
    }
  );

  const authenticator = new Authenticator(sessionStorage, {
    sessionKey: platformStrategy.sessionKey,
    sessionErrorKey: platformStrategy.sessionErrorKey,
  });
  authenticator.use(platformStrategy);

  return { authenticator, platformStrategy };
};
