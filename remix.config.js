/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: [".*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  appDirectory: "app",
  browserBuildDirectory: "public/build.tvf",
  publicPath: "/build.tvf/",
  serverBuildDirectory: "api/_build.tvf",
};
