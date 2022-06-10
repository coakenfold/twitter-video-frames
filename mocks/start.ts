import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import "~/utils";

const server = setupServer(...handlers);

// const server = setupServer();
server.listen({ onUnhandledRequest: "warn" });
console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
