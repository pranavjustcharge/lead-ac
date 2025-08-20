import { Request, Response } from "express";
import mongoose from "mongoose";
import leadFollowUpModel, {ILeadFollowUp} from "../model/lead.follow.up.model";
import { sendResponse } from "../utils/response";
import { messages } from "../constants/message";
import moment from 'moment';
import History, { IHistory } from '../model/history.model';  


// Create a new lead follow-up
export const createLeadFollowUp = async (req: Request, res: Response): Promise<void> => {   
  try {
    const {
      leadId,
      staffMember,
      followUpDate,
      followUpStatus,
      notes,
      createdBy,
      updatedBy,
      tenantId, // must be provided by frontend
    }: ILeadFollowUp & { tenantId: string } = req.body;

    // Create a new lead follow-up
    const newFollowUp: ILeadFollowUp = new leadFollowUpModel({
      leadId: new mongoose.Types.ObjectId(leadId),
      staffMember,
      followUpDate,
      followUpStatus,
      notes,
      createdBy,
      updatedBy
    });

    await newFollowUp.save();

    // Create history entry
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Follow-Up Created",
      details: `A follow-up (${followUpStatus}) was scheduled by ${createdBy} on ${formattedDate}`,
      createdBy,
      createdAt: now,
    };

    await History.findOneAndUpdate(
      { leadId: leadId },
      {
        $push: { actions: action },
        $setOnInsert: { tenantId },
      },
      { new: true, upsert: true }
    );

    // Prepare response
    const responseData = {
      followUp: newFollowUp,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.leadFollowUpCreated, responseData);

  } catch (error: any) {
    console.error(error);
    sendResponse(res, error.statusCode , false, messages.serverError, error.message);
  }
};

// Update an existing lead follow-up
export const updateLeadFollowUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { staffMember, followUpDate, followUpStatus, notes, updatedBy }: Partial<ILeadFollowUp> = req.body;

        // Find the lead follow-up by ID
        const followUp = await leadFollowUpModel.findById(id);
        if (!followUp) {
            sendResponse(res, res.statusCode, false, messages.leadNotFound);
            return;
        }

        // Update the follow-up details
        if (staffMember) followUp.staffMember = staffMember;
        if (followUpDate) followUp.followUpDate = followUpDate;
        if (followUpStatus) followUp.followUpStatus = followUpStatus;
        if (notes) followUp.notes = notes;
        if (updatedBy) followUp.updatedBy = updatedBy;

        // Save the updated follow-up
        await followUp.save();

  // === Add History Tracking ===
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Follow-up Updated",
      details: `Lead follow-up was updated by ${updatedBy || 'System'} on ${formattedDate}`,
      createdBy: updatedBy || 'System',
      createdAt: now,
    };

    // Push action to History
    await History.findOneAndUpdate(
      { leadId: followUp.leadId }, // assuming leadId is stored in followUp
      {
        $push: { actions: action }
      },
      { new: true, upsert: true }
    );

    // Optional: include history in response
    const responseData = {
      followUp,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.leadFollowUpUpdated, responseData);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
};

// Delete a lead follow-up
export const deleteLeadFollowUp = async (req: Request, res: Response): Promise<void> => {   
    try {
        const { id } = req.params;
        const { deletedBy } = req.body;
        
        if(!deletedBy){
          sendResponse(res,res.statusCode, false, messages.deleteBynotfound);
        }

        // Find the lead follow-up by ID
        const followUp = await leadFollowUpModel.findById(id);
        if (!followUp) {
            sendResponse(res, res.statusCode, false, messages.leadNotFound);
            return;
        }

        // Delete the follow-up
        await leadFollowUpModel.findByIdAndDelete(id);

        // === History Tracking ===
       const now = new Date();
       const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Follow-up Deleted",
      details: `Lead follow-up was deleted by ${deletedBy || 'System'} on ${formattedDate}`,
      createdBy: deletedBy || 'System',
      createdAt: now,
    };

    // Save to history
    await History.findOneAndUpdate(
      { leadId: followUp.leadId },
      {
        $push: { actions: action }
      },
      { new: true, upsert: true }
    );

    // Optional: Send history back in response
    const responseData = {
      deletedFollowUp: followUp,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.leadFollowUpDeleted, responseData);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}

// Get all lead follow-ups
export const getAllLeadFollowUps = async (req: Request, res: Response): Promise<void> => {          
    try {
        // Fetch all lead follow-ups
        const followUps = await leadFollowUpModel.find().populate('leadId', 'name email'); 

        // Send success response
        sendResponse(res, res.statusCode, true, messages.leadFollowUpRetrieved, followUps);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}

// Get a lead follow-up by ID
export const getLeadFollowUpById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the lead follow-up by ID
        const followUp = await leadFollowUpModel.findById(id).populate('leadId', 'name email');
        if (!followUp) {
            sendResponse(res, res.statusCode, false, messages.leadNotFound);
            return;
        }

        // Send success response
        sendResponse(res, res.statusCode, true, messages.leadFollowUpRetrieved, followUp);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}


