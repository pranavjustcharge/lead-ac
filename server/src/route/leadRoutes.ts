import { Router } from "express";
import { createLead, updateLead, getLeadById, getAllLeads, filterLeadsByStatus } from "../controller/lead.controller";

const router = Router();
router.post("/create", createLead);
router.put("/update/:id", updateLead);
router.get("/get", getLeadById);
router.get("/all/leads", getAllLeads);
router.post("/filter/status", filterLeadsByStatus);

export default router;  



