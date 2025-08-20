import { Router } from "express";
import { createLeadBooking, getAllLeadBookings, getLeadBookingById, updateLeadBooking, deleteLeadBooking } from "../controller/lead.booking.controller";

const router = Router();
router.post("/", createLeadBooking);
router.put("/:id", updateLeadBooking);
router.get("/:id", getLeadBookingById);
router.get("/", getAllLeadBookings);
router.delete("/:id", deleteLeadBooking);

export default router;
