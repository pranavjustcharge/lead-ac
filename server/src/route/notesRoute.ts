import { Router } from "express";
import { createNotes, updateNote, deleteNote, getAllNotes,getNoteById } from "../controller/notes.controller";

const router = Router();
router.post("/", createNotes);
router.put("/:id", updateNote);
router.get("/:id", getNoteById);
router.get("/", getAllNotes);
router.delete("/:id",deleteNote);

export default router;  



