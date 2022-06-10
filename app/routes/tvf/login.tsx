import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getUserPrefs, userPrefs } from "~/cookies";

import type { LoaderFunction, ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const cookie = await getUserPrefs(request);

  const form = await request.formData();
  const formCanRequestEmail = !!(form.get("canRequestEmail") as
    | string
    | undefined);

  cookie.canRequestEmail = formCanRequestEmail;
  return redirect(`/tvf/login`, {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
};

export interface LoaderOutput {
  build: string | undefined;
  canRequestEmail: boolean;
}
export const loader: LoaderFunction = async ({ request }) => {
  const build = process.env.BUILD;
  const cookie = await getUserPrefs(request);

  return json({
    build,
    canRequestEmail:
      cookie.canRequestEmail === undefined ? true : cookie.canRequestEmail,
  });
};
export default function Index() {
  const { build, canRequestEmail } = useLoaderData<LoaderOutput>();
  const submit = useSubmit();
  function handleChange(event: {
    currentTarget:
      | FormData
      | HTMLFormElement
      | HTMLButtonElement
      | HTMLInputElement
      | URLSearchParams
      | { [name: string]: string }
      | null;
  }) {
    submit(event.currentTarget, { replace: true });
  }
  return (
    <div className="flex justify-center p-8">
      <main className="w-full max-w-3xl">
        <h1
          className="font-light text-slate-900 dark:text-slate-50"
          title="Song to Album Playlist"
        >
          TVF
        </h1>
        <Form method="post" action="/tvf/authorize/spotify">
          <button className="dark:highlight-white/20 my-2 flex h-14 w-full items-center justify-center rounded-lg bg-slate-900 px-6 text-xl font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:bg-sky-500 dark:hover:bg-sky-400 sm:w-auto">
            Log in with Platform
          </button>
        </Form>
        <Form method="post" action="/tvf/login" onChange={handleChange}>
          <input
            type="checkbox"
            id="canRequestEmail"
            name="canRequestEmail"
            defaultChecked={canRequestEmail}
          />
          <label htmlFor="canRequestEmail"> share email with TVF</label>
        </Form>
        <div>
          {build ? (
            <small className="mt-16 mb-8 block bg-slate-900 text-right text-xs text-slate-800 ">
              {build}
            </small>
          ) : null}
        </div>
      </main>
    </div>
  );
}
