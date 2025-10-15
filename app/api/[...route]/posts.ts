import { Hono } from "hono";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db/index.js";
import { favorite } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono().get("/", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // const favorites = await db
  //   .select({
  //     id: favorite.id,

  //     postId: favorite.postId,
  //   })
  //   .from(favorite)
  //   .where(eq(favorite.userId, session.user.id));

  // return c.json({ favorites });
  //
  return c.json({ session });
});

export default app;
