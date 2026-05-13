import Elysia from "elysia";
import swagger from "@elysiajs/swagger";

export const createApp = () => {
  const app = new Elysia()
    .use(swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Event Ticketing & Booking System",
          version: "1.0.0",
          description: "Clean Architecture + DDD implementation",
        },
      },
    }))
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
};

export type App = ReturnType<typeof createApp>;
