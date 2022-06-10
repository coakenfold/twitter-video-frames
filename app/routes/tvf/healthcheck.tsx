import type { LoaderFunction } from "@remix-run/node";

import { db } from "~/service/db.server";

export const requiredEnvVars = () => {
  return new Promise((resolve, reject) => {
    const requiredEnvs = [
      "DATABASE_URL",
      "SESSION_SECRET",
      "PLATFORM_CLIENT_ID",
      "PLATFORM_CLIENT_SECRET",
      "PLATFORM_CALLBACK_URL",
    ];
    interface RequiredEnvAccumulator {
      name: string;
      message: string;
    }
    const reducedRequiredEnvs = requiredEnvs.reduce((accumulator, envName) => {
      const envValue = process.env[envName];
      if (envValue === undefined) {
        accumulator.push({
          name: envName,
          message: `\`${envName}\` is undefined`,
        });
      }
      return accumulator;
    }, [] as RequiredEnvAccumulator[]);
    if (reducedRequiredEnvs.length > 0) {
      return reject(reducedRequiredEnvs);
    }

    return resolve(undefined);
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    const url = new URL("/", `http://${host}`);
    await Promise.all([
      // if the required env vars are set,
      requiredEnvVars(),
      // connect to the database to make a simple query,
      db.user.count(),
      // and make a HEAD request to ourselves
      fetch(url.toString(), { method: "HEAD" }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    // we should be good!
    return new Response("OK");
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
};
