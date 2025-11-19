import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";

import { db } from "@/db/index";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI(), reactStartCookies()],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://imad-ana.pages.dev",
    "http://95.216.252.98:8030",
    "https://betaanar.fibladi.com",
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true, // Newbrowser standards will mandate this for foreign cookies
    },
  },
});

// console.log('🧩 BetterAuth Routes:', auth.handler)

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
