import express from 'express'
import { createEvent, detailEvent, registerEvent } from '../controllers/event.js';


const router = express.Router()

router.post("/create",createEvent);
router.post("/register",registerEvent);
router.get("/details/:id",detailEvent);

export default router;