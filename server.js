import express from 'express'
import dotenv from 'dotenv'
import { sql } from './utlis/db.js';

dotenv.config();
const PORT = process.env.PORT || 5000;


const app = express();


async function initDB() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
      );
    `;

   
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        date_time TIMESTAMP WITH TIME ZONE NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity <= 1000)
      );
    `;

    
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, event_id)
      );
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initDB:", error);
  }
}

initDB().then(app.listen(PORT,()=>{
console.log(`listening port ${PORT}`)
}));