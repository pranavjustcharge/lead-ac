import { Request, Response } from "express";
import HistoryModel from "../model/history.model";
import { sendResponse } from "../utils/response";
import { messages } from "../constants/message"; 
import mongoose from "mongoose";


//get history by id
export const getHistoryByLeadId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;


    
    // Validate leadId
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      sendResponse(res, res.statusCode, false, messages.defaultmessage);
      return;
    }

    // Fetch all history documents for the given leadId
    const histories = await HistoryModel.find({ leadId }).populate("leadId", "firstName lastName email");

    // Sort the actions array for each history document
     const sortedHistories = histories.map(history => {
     const sortedActions = history.actions.sort(
       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
     );

    return {
       ...history.toObject(),
       actions: sortedActions,
      };
    });



    if (histories.length === 0) {
      sendResponse(res, res.statusCode, false, messages.leadNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.getHistories, histories);
  } catch (error: any) {
    sendResponse(res, res.statusCode, false, error.message);
  }
};






