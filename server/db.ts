import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Single postgres client for the app
const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(queryClient);