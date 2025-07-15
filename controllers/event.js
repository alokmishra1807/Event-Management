import moment from 'moment';
import { sql } from '../utlis/db.js';

export const createEvent = async (req, res) => {
  try {
    const { title, dateTime, location, capacity } = req.body;

    if (!title || !dateTime || !location || capacity === undefined) {
      return res.status(400).json({ message:"missing required fields"});
    }

    
    if (typeof capacity !== "number"||capacity <= 0||capacity > 1000) {
      return res.status(400).json({ message:"capacity must be a positive number ≤ 1000"});
    }

    const parsedDate = moment(dateTime, "H:mm DD-MM-YYYY", true); 

    if (!parsedDate.isValid()) {
      return res.status(400).json({ error: "Invalid date/time format" });
    }


    const isoDate = parsedDate.toISOString();

    
    const [event] = await sql`
      INSERT INTO events (title, date_time, location, capacity)
      VALUES (${title}, ${isoDate}, ${location}, ${capacity})
      RETURNING id;
    `;

    return res.status(201).json({eventId:event.id});
  } catch (error) {
    console.error("error in creating evemt:", error);
    return res.status(500).json({ error:"internal server error"});
  }
};



export const registerEvent = async (req, res) => {
  try {
const { user_id, event_id } = req.body;

  
    if (!user_id || !event_id) {
   return res.status(400).json({ error: "user_id and event_id are required" });
    }

   
    const [event] = await sql`
 SELECT id, date_time, capacity FROM events WHERE id = ${event_id};
    `;

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

   
const now = moment();
    const eventTime = moment(event.date_time);
    if (eventTime.isBefore(now)) {
      return res.status(400).json({ message:"cannot register for a past event"});
    }

    const [{count}] = await sql`
      SELECT COUNT(*)::int AS count
      FROM registrations
      WHERE event_id = ${event_id};
    `;

    if (count >= event.capacity) {
      return res.status(400).json({ message:"event full"});
    }

    const [found] = await sql`
      SELECT 1 FROM registrations
      WHERE user_id = ${user_id} AND event_id = ${event_id};
    `;

    if (found) {
      return res.status(400).json({message:"User already registered for this event"});
    }

  
    await sql`
      INSERT INTO registrations(user_id, event_id)
      VALUES (${user_id}, ${event_id});
    `;

    return res.status(201).json({message:"user registered successfully"});

  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({error:"internal server error" });
  }
};


export const detailEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required in URL params" });
    }

    const [event] = await sql`
      SELECT * FROM events WHERE id = ${id};
    `;

    if (!event) {
      return res.status(404).json({ message:"event not found" });
    }

   
    const registeredUsers = await sql`
      SELECT u.id, u.name
      FROM registrations r
      JOIN users u ON u.id = r.user_id
      WHERE r.event_id = ${id};
    `;

    return res.status(200).json({
      ...event,
      registered_users: registeredUsers
    });

  } catch (error) {
    console.error("Error getting event details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
