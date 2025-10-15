import { Hono } from "hono";
import { auth } from "@/lib/auth/auth";
import type { AuthType } from "@/lib/auth/auth";

const router = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

router.on(["POST", "GET", "OPTIONS"], "/*", async (c) => {
  return auth.handler(c.req.raw);
});
// router.get("/ok", async (c) => {
//   const res = await auth.api.ok();
//   return c.json({ res });
// });

export default router;
