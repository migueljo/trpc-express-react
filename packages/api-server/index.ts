import express from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC } from "@trpc/server";
import cors from "cors";
import { z } from "zod";

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;
const DEFAULT_SIZE = 10;

const messages: ChatMessage[] = [
  ...Array.from({ length: 100 }, (_, i) => ({
    user: `user${i}`,
    message: `message${i}`,
  })),
];

const appRouter = router({
  hi: publicProcedure.query(async () => {
    return "Hi from api-server 2";
  }),
  getMessage: publicProcedure
    .input(
      z
        .object({
          size: z.number().default(DEFAULT_SIZE),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return messages.slice(0, input?.size ?? DEFAULT_SIZE);
    }),
  addMessage: publicProcedure
    .input(z.object({ user: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      messages.push(input);
    }),
});
export type AppRouter = typeof appRouter;

const app = express();
const port = 8080;

app.use(cors());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);
app.get("/", (req, res) => {
  res.send("Hello from api-server");
});

app.listen(port, () => {
  console.log(`api-server listening at http://localhost:${port}`);
});

interface ChatMessage {
  user: string;
  message: string;
}
