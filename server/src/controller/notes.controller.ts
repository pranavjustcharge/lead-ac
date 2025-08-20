import { Request, Response } from "express";
import mongoose from "mongoose";
import NotesModel, { INotes } from "../model/notes.model"; 
import { sendResponse } from "../utils/response"; 
import { messages } from "../constants/message"; 
import moment from 'moment';
import History, { IHistory } from '../model/history.model';  



//create Notes
export const createNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      notes,
      leadId,
      createdBy,
      updatedBy,
      tenantId,
      startDate,
      endDate,
    }: Partial<INotes> = req.body;

    // Validate required fields
    if (!notes || !leadId || !createdBy || !updatedBy || !tenantId) {
      sendResponse(res, res.statusCode, false, "Missing required fields");
      return;
    }

    // Create and save the note
    const newNote: INotes = new NotesModel({
      notes,
      leadId: new mongoose.Types.ObjectId(leadId),
      createdBy,
      updatedBy,
      tenantId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    await newNote.save();

    // Prepare history action
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Note Created",
      details: `A new note was created by ${createdBy} on ${formattedDate}`,
      createdBy,
      createdAt: now,
    };

    // Push action to History collection
    await History.findOneAndUpdate(
      { leadId },
      {
        $push: { actions: action },
        $setOnInsert: { tenantId },
      },
      { new: true, upsert: true }
    );

    // Prepare response
    const responseData = {
      noteId: newNote._id,
      leadId,
      tenantId,
      notes: newNote.notes,
      startDate: newNote.startDate,
      endDate: newNote.endDate,
      actions: [action],
    };

    sendResponse(res, res.statusCode, true, messages.noteCreated, responseData);

  } catch (error: any) {
    console.error(error);
    sendResponse(res, res.statusCode, false, error.message);
  }
};

// Update an existing lead follow-up
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes, updatedBy }: Partial<INotes> = req.body;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidNotesId);
      return;
    }


      // Find the existing note (to get leadId and tenantId for history)
    const existingNote = await NotesModel.findById(id);
    if (!existingNote) {
      sendResponse(res, res.statusCode, false, messages.noteNotFound);
      return;
    }

    // Find and update the note
    const updatedNote = await NotesModel.findByIdAndUpdate(
      id,
      {
        ...(notes && { notes }),
        ...(updatedBy && { updatedBy }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedNote) {
      sendResponse(res, res.statusCode, false, messages.noteNotFound);
      return;
    }

    
    // Prepare history action
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Note Updated",
      details: `Note was updated by ${updatedBy} on ${formattedDate}`,
      createdBy: updatedBy,
      createdAt: now,
    };

    // Push action to History collection
    await History.findOneAndUpdate(
      { leadId: existingNote.leadId },
      {
        $push: { actions: action },
        $setOnInsert: { tenantId: existingNote.tenantId },
      },
      { new: true, upsert: true }
    );

    // Prepare response
    const responseData = {
      noteId: updatedNote._id,
      leadId: updatedNote.leadId,
      tenantId: updatedNote.tenantId,
      notes: updatedNote.notes,
      startDate: updatedNote.startDate,
      endDate: updatedNote.endDate,
      actions: [action],
    };

    sendResponse(res, res.statusCode, true, messages.noteUpdated, responseData);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// Delete a lead follow-up
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidNotesId);
      return;
    }

    // Check if the note exists
    const note = await NotesModel.findById(id);
    if (!note) {
      sendResponse(res, res.statusCode, false, messages.noteNotFound);
      return;
    }

    // Delete the note
    await NotesModel.findByIdAndDelete(id);

    // Prepare history action
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Note Deleted",
      details: `Note was deleted by ${note.updatedBy} on ${formattedDate}`,
      createdBy: note.updatedBy || 'System',
      createdAt: now,
    };

    // Push action to History collection
    await History.findOneAndUpdate(
      { leadId: note.leadId },
      {
        $push: { actions: action },
        $setOnInsert: { tenantId: note.tenantId },
      },
      { new: true, upsert: true }
    );

    // Optional: Response payload with context
    const responseData = {
      noteId: note._id,
      leadId: note.leadId,
      tenantId: note.tenantId,
      actions: [action],
    };

    sendResponse(res, res.statusCode, true, messages.noteDeleted, responseData);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// Get all lead follow-ups
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all notes and populate the lead's name and email
    const notes = await NotesModel.find().populate("leadId", "notes");

    sendResponse(res, res.statusCode, true, messages.notesRetrieved , notes);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// get notes by id
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidNotesId);
      return;
    }

    // Find the note by ID and populate lead info
    const note = await NotesModel.findById(id).populate("leadId", "notes");

    if (!note) {
      sendResponse(res, res.statusCode, false, messages.noteNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.notesRetrieved, note);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};




