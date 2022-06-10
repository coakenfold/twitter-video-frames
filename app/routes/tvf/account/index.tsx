import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, Link } from "@remix-run/react";

import { authentication } from "~/models/auth.server";

import { logout } from "~/session.server";

import {
  getUserByPlatformId,
  deleteUserByPlatformId,
} from "~/models/user.server";
import type { User } from "~/models/user.server";

import {
  getAccountByPlatformId,
  updateAccountByPlatformId,
  deleteAccountByPlatformId,
} from "~/models/account.server";

import type { Account } from "~/models/account.server";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);
  if (!session) {
    return redirect("/tvf#noSession");
  }
  const sessionUser = session?.user as User;

  const user = await getUserByPlatformId(sessionUser.id);
  const account = await getAccountByPlatformId(sessionUser.id);

  // Ensure the user is editing their own data
  if (session?.user?.id !== user?.platformId) {
    return redirect("/tvf#noSessionUserId");
  }
  if (!account) {
    return redirect("/tvf#noAccount");
  }

  const form = await request.formData();
  const formTarget = form.get("formTarget");

  if (formTarget === "delete") {
    const accountDelete = await deleteAccountByPlatformId(account.platformId);
    const userDelete = await deleteUserByPlatformId(account.platformId);
    console.log("Delete results:", { accountDelete, userDelete });
    return logout({
      request,
      url: "/tvf/account/deleted",
      shouldDeleteUserPrefs: true,
    });
  }
  if (formTarget === "settings") {
    const formNewsletter = form.get("newsletter");
    const wantsNewsletter = !!formNewsletter;
    const accountUpdate = await updateAccountByPlatformId({
      platformId: account.platformId,
      data: { newsletter: wantsNewsletter },
    });
    console.log("accountUpdate", accountUpdate);
    return redirect("/tvf/account");
  }

  return redirect("/tvf/account");
};

export interface LoaderOutput {
  user: User;
  account: Account;
}
export const loader: LoaderFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);

  if (!session?.user) {
    return redirect("/tvf");
  }

  const platformId = session?.user?.id;
  const user = await getUserByPlatformId(platformId);
  if (!user) {
    return redirect("/tvf");
  }

  const account = await getAccountByPlatformId(platformId);

  if (!account) {
    return redirect("/tvf");
  }
  return { user, account };
};
export default function AccountManagement() {
  const { user, account } = useLoaderData<LoaderOutput>();
  const { platformId, email } = user;
  const [checked, setChecked] = useState(account?.preferences.newsletter);

  const subHeader =
    "sm:text-3xl text-3xl mb-2 text-slate-900 dark:text-slate-50";
  const section = "my-10";
  return (
    <div className="flex justify-center p-8">
      <main className="w-full max-w-3xl">
        <div className="flex items-center justify-between space-x-4">
          <h1
            className="font-light text-slate-900 dark:text-slate-50"
            title="Song to Album Playlist"
          >
            TVF | Account
          </h1>

          <div className="flex items-center space-x-4">
            <Link
              className="dark:text-sky-40 tracking-tight text-sky-500 hover:text-sky-200"
              to={"/tvf"}
            >
              Home
            </Link>
          </div>
        </div>
        <div>
          <h1 className="my-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Account
          </h1>
          <section className={section}>
            <h2 className={subHeader}>Details</h2>
            <table className="w-full  text-left">
              <thead>
                <tr>
                  <th>Platform ID</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{platformId}</td>
                  <td>{email ? email : "Not shared with TVF"}</td>
                </tr>
              </tbody>
            </table>
          </section>
          {email ? (
            <section className={section}>
              <h2 className={subHeader}>Change settings</h2>

              <Form method="post">
                <fieldset className="my-2 ">
                  <input type="hidden" name="formTarget" value="settings" />
                  <input
                    type="checkbox"
                    name="newsletter"
                    id="newsletter"
                    defaultChecked={checked}
                    onClick={() => {
                      setChecked(!checked);
                    }}
                  />{" "}
                  <label htmlFor="newsletter">
                    I'll accept (the occasional) email from TVF
                  </label>
                </fieldset>
                <button
                  className="dark:highlight-white/20 my-4 flex w-full items-center justify-center rounded-lg bg-slate-900 py-2 px-4 font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:bg-sky-500 dark:hover:bg-sky-400 sm:w-auto"
                  type="submit"
                >
                  Update
                </button>
              </Form>
            </section>
          ) : (
            <></>
          )}

          <section className={section}>
            <h2 className={subHeader}>Delete account</h2>

            <Form method="post">
              <fieldset className="my-2 ">
                <input type="hidden" name="formTarget" value="delete" />
                <input type="hidden" name="platformId" value={platformId} />

                <button
                  className="dark:highlight-white/20 flex w-full items-center justify-center rounded-lg bg-red-900 py-2 px-4 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-50 dark:bg-rose-500 dark:hover:bg-rose-400 sm:w-auto"
                  type="submit"
                >
                  Delete
                </button>
              </fieldset>
            </Form>
          </section>

          <div className="my-20">
            <section className={section}>
              <h2 className={subHeader}>Privacy policy</h2>

              <p className="mb-2">
                We save your Platform user name and (if you give us permission)
                your email. We won't sell or share this information
              </p>
              <p>
                We would like to send you a newsletter at some point in the
                future. You can opt out using the form above
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
