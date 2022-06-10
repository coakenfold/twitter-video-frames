import { Link } from "@remix-run/react";
export default function Deleted() {
  return (
    <div className="flex justify-center p-8">
      <main className="w-full max-w-3xl">
        <div className="flex items-center justify-between space-x-4">
          <h1
            className="font-light text-slate-900 dark:text-slate-50"
            title="Song to Album Playlist"
          >
            TVF | Account | Deleted
          </h1>
        </div>

        <h2 className="mb-8 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Thanks for trying out <span title="Twitter Video Frames">TVF</span>!
        </h2>
        <p className="my-2 text-xl text-slate-900 dark:text-slate-50 sm:text-2xl">
          We deleted your account
        </p>
        <p className="my-8">
          Hope you'll come back and check us out again in the future
        </p>
        <Link
          to="/tvf"
          className="dark:text-sky-40 tracking-tight tracking-tight text-sky-500 hover:text-sky-200 sm:text-2xl"
        >
          TVF Forever
        </Link>
      </main>
    </div>
  );
}
