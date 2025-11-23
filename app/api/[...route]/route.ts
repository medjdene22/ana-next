import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import auth from "./auth";
import type { AuthType } from "@/lib/auth";

import posts from "./posts";
import fibladi from "./fibladi";

const app = new Hono<{ Variables: AuthType }>({ strict: false }).basePath(
  "/api",
);

// const routes = [auth ] as const;

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];
app
  .use(
    "*", // or replace with "*" to enable cors for all routes
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://imad-ana.pages.dev",
        "http://95.216.252.98:8030",
        "http://95.216.252.98:8030",
        "https://betaanar.fibladi.com",
      ], // replace with your origin
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Better-Auth",
      ],
      allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .options("*", (c) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Credentials", "true");
    c.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-Better-Auth",
    );
    return c.body(null, 204);
  })
  .route("/auth", auth)
  .route("/posts", posts)
  .route("/fibladi", fibladi);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
