import { Router } from "express";
import { getHistoryByLeadId } from "../controller/history.controller";

const router = Router();

router.get("/:leadId", getHistoryByLeadId);


export default router;  



