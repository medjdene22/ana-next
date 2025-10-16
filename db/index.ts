import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as dockerDrizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
// import "dotenv/config"; // top of src/index.ts
//
//
const env = process.env.DB_ENV!;

export const db =
  env === "dev"
    ? dockerDrizzle(
        new Pool({
          connectionString: process.env.DATABASE_URL!,
        }),
        { schema },
      )
    : neonDrizzle({
        client: neon(process.env.DATABASE_URL!),
        schema: { ...schema },
      });

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle({ client: sql, schema: { ...schema } });

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });

// export const db = drizzle(pool, { schema });
