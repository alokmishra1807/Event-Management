import { sql } from "../utlis/db.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name ||!email) {
      return res.status(400).json({ message:"name and email are required"});
    }

    const [found] = await sql`
      SELECT id FROM users WHERE email = ${email};
    `;

    if (found) {
      return res.status(409).json({message:"email already used"});
    }

    const [user] = await sql`
      INSERT INTO users (name, email)
      VALUES (${name}, ${email})
      RETURNING id;
    `;
    return res.status(201).json({userId:user.id});

  } catch (error) {
    console.error("error in creating user:",error);
    return res.status(500).json({ error:"internal server error" });
  }
};
