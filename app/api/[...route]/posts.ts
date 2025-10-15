import { Hono } from "hono";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db/index";
import { favorite } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/seed", async (c) => {
    const res = await auth.api.signInEmail({
      headers: c.req.raw.headers,

      body: {
        email: "imad55777@gmail.com",
        // name: "imad eddine",
        password: "imad55777",
      },
    });

    return c.json({ res: res });
  })
  .get("/", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // const favorites = await db
    //   .select({
    //     id: favorite.id,

  // return c.json({ favorites });
  //
  return c.json({ session });
});

export default app;
