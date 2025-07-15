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
