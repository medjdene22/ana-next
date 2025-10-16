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
import z from "zod";

const app = new Hono()
  .get(
    "/byIds",
    zValidator(
      "query",
      z.object({
        ids: z.string().transform((val) => val.split(",")),
      }),
    ),
    async (c) => {
      const values = c.req.valid("query");
      const codes = values.ids.map(generateShortlinks);
      const posts = await Promise.all(
        codes.map(async (code) => {
          const res = await fetch(
            `https://apin.fibladi.com/fibladi/shortlink?c=${code}`,
          );
          return res.json();
        }),
      );

      return c.json({ posts });
    },
  )
  .get("/favorite", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const favorites = await db
      .select({
        postId: favorite.postId,
      })
      .from(favorite)
      .where(eq(favorite.userId, session.user.id));

    const codes = favorites.map((fav) => generateShortlinks(fav.postId));
    const posts = await Promise.all(
      codes.map(async (code) => {
        const res = await fetch(
          `https://apin.fibladi.com/fibladi/shortlink?c=${code}`,
        );
        return res.json();
      }),
    );

    return c.json({ posts });
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

    const [{ subscriptions }] = await db
      .select({
        subscriptions: subscription.subscribe,
      })
      .from(subscription)
      .where(eq(subscription.userId, session.user.id));

    return c.json({ subscriptions });
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

function generateShortlinks(id: string): string {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length;
  let short = "";

  let num = Number(id);
  while (num > 0) {
    short = chars[num % base] + short;
    num = Math.floor(num / base);
  }

  return short;
}
