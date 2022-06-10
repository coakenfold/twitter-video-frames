import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authentication } from "~/models/auth.server";

import { MiniForm } from "~/components/MiniForm";
import {
  getAllUsers,
  getUserByPlatformId,
  deleteUserByPlatformId,
} from "~/models/user.server";
import type { User } from "~/models/user.server";

export interface LoaderOutput {
  displayName: User["displayName"];
  email: User["email"];
  platformId: User["platformId"];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);

  if (session?.user?.id !== "c_oak") {
    return redirect("/tvf");
  }
  const users = await getAllUsers();

  return users;
};

export const DASHBOARD_URL = "/tvf/admin/dashboard";
export const action: ActionFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);
  if (session && session?.user?.id === "c_oak") {
    const form = await request.formData();

    const platformId = form.get("platformId") as string | undefined;

    if (platformId) {
      const user = await getUserByPlatformId(platformId);
      if (user) {
        const output = await deleteUserByPlatformId(platformId);
        const urlParam = output?.displayName
          ? `?deleted=${output?.displayName}`
          : "";
        return redirect(`${DASHBOARD_URL}${urlParam}`);
      }
      return redirect(`${DASHBOARD_URL}?error=noUser`);
    }
  }
};

export default function Create() {
  const users = useLoaderData<LoaderOutput[]>();

  return (
    <main className="mx-16 my-16">
      <h1 className="font-light text-slate-900 dark:text-slate-50">
        Dashboard
      </h1>

      {users.map(({ displayName, email, platformId }) => {
        return (
          <div key={platformId}>
            {displayName} - {email}{" "}
            <MiniForm
              isSubmitting={false}
              method="post"
              inputs={[{ name: "platformId", value: platformId }]}
            >
              <button
                className="dark:text-sky-40 font-bold tracking-tight text-sky-500 "
                type="submit"
              >
                Delete
              </button>
            </MiniForm>
          </div>
        );
      })}
    </main>
  );
}
