import { Request, Response } from "express";
import History from "../model/history.model";
import mongoose from "mongoose";
import moment from "moment";
import LeadBooking, { ILeadBooking } from "../model/lead.booking.model";
import { sendResponse } from "../utils/response"; 
import { messages } from "../constants/message"; 



//Create Lead Booking
export const createLeadBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      leadId,
      typeOfService,
      bookingTime,
      notes,
      createdBy,
      updatedBy,
      tenantId, 
    }: ILeadBooking & { tenantId: string } = req.body;

    // Save lead booking
    const newBooking = new LeadBooking({
      leadId,
      typeOfService,
      bookingTime,
      notes,
      createdBy,
      updatedBy,
    });

    await newBooking.save();

    // Create history entry
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Booking Created",
      details: `Lead booking  was created by ${createdBy} on ${formattedDate}`,
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

    // Respond to client
    const responseData = {
      booking: newBooking,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.leadBookingCreated, responseData);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, messages.leadBookingCreationFailed, error.message);
  }
};

//Get all bookings (with pagination)
export const getAllLeadBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await LeadBooking.countDocuments();
    const bookings = await LeadBooking.find().populate("leadId", "firstName lastName email").skip(skip).limit(limit).sort({ createdAt: -1 });

    sendResponse(res, res.statusCode, true, messages.leadBookingsRetrieved, {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, messages.leadBookingsRetrievalFailed, error.message);
  }
};

//Get booking by ID
export const getLeadBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidBookingId);
      return;
    }

    const booking = await LeadBooking.findById(id).populate("leadId");

    if (!booking) {
      sendResponse(res, res.statusCode, false, messages.bookingNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.bookingRetrieved, booking);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, messages.bookingRetrievalFailed, error.message);
  }
};

//Update booking
export const updateLeadBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { updatedBy } = updateData; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidBookingId);
      return;
    }

      // Find the existing booking first to get leadId and tenantId for history logging
    const existingBooking = await LeadBooking.findById(id);
    if (!existingBooking) {
      sendResponse(res, res.statusCode, false, messages.bookingNotFound);
      return;
    }

    // Update the booking
    const updatedBooking = await LeadBooking.findByIdAndUpdate(id, updateData, { new: true });

    // Create history entry
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Booking Updated",
      details: `Lead booking was updated by ${updatedBy} on ${formattedDate}`,
      createdBy: updatedBy,
      createdAt: now,
    };

    // Push to history
    await History.findOneAndUpdate(
      { leadId: existingBooking.leadId },
      {
        $push: { actions: action }
      },
      { new: true, upsert: true }
    );

    // Optional: Response payload with booking + action
    const responseData = {
      booking: updatedBooking,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.bookingUpdated, responseData);

  } catch (error: any) {
    sendResponse(res, res.statusCode, false, messages.bookingUpdateFailed, error.message);
  }
};

//Delete booking
export const deleteLeadBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidBookingId);
      return;
    }

    // Fetch the booking before deletion
    const booking = await LeadBooking.findById(id);
    if (!booking) {
      sendResponse(res, res.statusCode, false, messages.bookingNotFound);
      return;
    }

    // Delete the booking
    await LeadBooking.findByIdAndDelete(id);

    // Create history entry
    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Booking Deleted",
      details: `Lead booking was deleted by ${deletedBy} on ${formattedDate}`,
      createdBy: deletedBy || 'System',
      createdAt: now,
    };

    // Push to History collection
    await History.findOneAndUpdate(
      { leadId: booking.leadId },
      {
        $push: { actions: action }
      },
      { new: true, upsert: true }
    );

    // Optional: Response payload with context
    const responseData = {
      deletedBooking: booking,
      historyAction: action,
    };

    sendResponse(res, res.statusCode, true, messages.bookingDeleted, responseData);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, messages.bookingDeletionFailed, error.message);
  }
};
