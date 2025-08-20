import { Router } from "express";
import { createSale, getAllSales, getSaleById, deleteSale } from "../controller/sales.controller";

const router = Router();
router.post("/", createSale);
router.get("/:id", getSaleById);
router.get("/", getAllSales);
router.delete("/:id",deleteSale);

export default router;  



