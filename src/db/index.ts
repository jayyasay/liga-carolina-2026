import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// We create a single SQL connection using the Neon connection string
const sql = neon(process.env.DATABASE_URL!);

// Creating the DB instance
export const db = drizzle(sql);
