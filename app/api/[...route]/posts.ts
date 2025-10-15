import { Hono } from "hono";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db/index";
import {
  favorite,
  subscription,
  insertFavSchima,
  insertSubscribe,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

const app = new Hono()
  .get("/favorite", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const favorites = await db
      .select({
        id: favorite.id,

        postId: favorite.postId,
      })
      .from(favorite)
      .where(eq(favorite.userId, session.user.id));

    return c.json({ favorites });
  })
  .post(
    "/favorite",
    zValidator(
      "json",
      insertFavSchima.pick({
        postId: true,
      }),
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const values = c.req.valid("json");

      await db
        .insert(favorite)
        .values({
          userId: session.user.id,
          postId: values.postId,
        })
        .onConflictDoNothing();

      return c.json({ session });
    },
  )
  .delete("/favorite/:postId", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const postId = c.req.param("postId");

    await db
      .delete(favorite)
      .where(
        and(eq(favorite.userId, session.user.id), eq(favorite.postId, postId)),
      );

    return c.json({ success: true });
  })

  .get("/sub", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const [subs] = await db
      .select()
      .from(subscription)
      .where(eq(favorite.userId, session.user.id));

    return c.json({ subs });
  })
  .patch(
    "/sub",
    zValidator(
      "json",
      insertSubscribe.pick({
        subscribe: true,
      }),
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!session?.user) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const { subscribe } = c.req.valid("json");

      // const [subs] = await db
      //   .select()
      //   .from(subscription)
      //   .where(eq(favorite.userId, session.user.id));
      await db
        .insert(subscription)
        .values({
          userId: session.user.id,
          subscribe,
        })
        .onConflictDoUpdate({
          target: subscription.userId, // unique column
          set: {
            subscribe, // updates the JSON
            updatedAt: new Date(), // refresh timestamp
          },
        });

      return c.json({ success: true });
    },
  );
//delete favorite

export default app;
