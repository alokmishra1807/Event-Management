import express from 'express'
import { cancelRegistration, createEvent, detailEvent, registerEvent } from '../controllers/event.js';


const router = express.Router()

router.post("/create",createEvent);
router.post("/register",registerEvent);
router.get("/details/:id",detailEvent);
router.post("/cancelRegistration",cancelRegistration);

export default router;