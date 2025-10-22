import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z, { string } from "zod";
import last from "@/data/last.json";

const app = new Hono().get(
  "lastnews",
  zValidator(
    "query",
    z.object({
      lang: string(),
      p: string(),
    }),
  ),
  async (c) => {
    return c.json(last);
  },
);

export default app;
