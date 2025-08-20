import { Router } from "express";
import { createSalesmanBooking,updatesalesmanBooking, getAllSalesmanBooking, getsalesmanBookingId, deletesalesmanBooking } from "../controller/salesman.booking.controller";

const router = Router();
router.post("/", createSalesmanBooking);
router.put("/:id",updatesalesmanBooking);
router.get("/:id", getsalesmanBookingId);
router.get("/", getAllSalesmanBooking);
router.delete("/:id",deletesalesmanBooking);

export default router;  



