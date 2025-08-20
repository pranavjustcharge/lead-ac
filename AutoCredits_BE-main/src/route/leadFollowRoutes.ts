import { Router } from "express";
import { createLeadFollowUp, updateLeadFollowUp, deleteLeadFollowUp, getAllLeadFollowUps, getLeadFollowUpById } from "../controller/lead.follow.up.controller";

const router = Router();
router.post("/", createLeadFollowUp);
router.put("/:id", updateLeadFollowUp);
router.get("/:id", getLeadFollowUpById);
router.get("/", getAllLeadFollowUps);
router.delete("/:id",deleteLeadFollowUp);

export default router;  



