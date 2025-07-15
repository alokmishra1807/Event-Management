import express from 'express'
import { createEvent } from '../controllers/event.js';


const router = express.Router()

router.post("/create",createEvent);

export default router;