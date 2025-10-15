import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
// import "dotenv/config"; // top of src/index.ts

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema: { ...schema } });

// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "./schema.js";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });

// export const db = drizzle(pool, { schema });
