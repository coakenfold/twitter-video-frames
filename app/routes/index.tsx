import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export interface LoaderOutput {
  build: string | undefined;
}
export const loader: LoaderFunction = async ({ request }) => {
  const build = process.env.BUILD;

  return {
    build,
  };
};
export default function Index() {
  const { build } = useLoaderData<LoaderOutput>();
  return (
    <div className="flex justify-center p-8">
      <main className="w-full max-w-3xl">
        <h1 className="font-light text-slate-900 dark:text-slate-50">
          Twitter Video Frames
        </h1>

        <a
          href="tvf"
          className=" dark:text-sky-40 tracking-tight tracking-tight text-sky-500 hover:text-sky-200 sm:text-4xl"
        >
          Update your banner image with frames from a video
        </a>
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
