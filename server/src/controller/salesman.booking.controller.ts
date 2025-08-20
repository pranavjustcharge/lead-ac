import { Request, Response } from "express";
import mongoose from "mongoose";
import salesmanBookingModel, {ISalesManBooking} from "../model/salesman.booking.model";
import { sendResponse } from "../utils/response";
import { messages } from "../constants/message";
import { error } from "console";



// Create a new salesman Booking
export const createSalesmanBooking = async (req: Request, res: Response): Promise<void> => {   
    try {
        const { salesmanName, bookingTime, notes, createdBy, updatedBy }: ISalesManBooking = req.body;
    
        // Create a salesman booking
        const salesmanBooking: ISalesManBooking = new salesmanBookingModel({
        salesmanName,
        bookingTime,
        notes,
        createdBy,
        updatedBy
        });
        await salesmanBooking.save();
    
        // Send success response
        sendResponse(res, res.statusCode, true, messages.salesmanBookingCreated, salesmanBooking);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, messages.serverError);
    }
};

// Update salesman booking
export const updatesalesmanBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { salesmanName, bookingTime, notes, createdBy, updatedBy }: Partial<ISalesManBooking> = req.body;

    // Find the salesman booking by ID
    const booking = await salesmanBookingModel.findById(id);
    if (!booking) {
      sendResponse(res, res.statusCode, false, messages.salesmanNotFound);
      return;
    }

    // Update only provided fields
    if (salesmanName) booking.salesmanName = salesmanName;
    if (bookingTime) booking.bookingTime = bookingTime;
    if (notes) booking.notes = notes;
    if (createdBy) booking.createdBy = createdBy;
    if (updatedBy) booking.updatedBy = updatedBy;

    await booking.save();

    sendResponse(res, res.statusCode, true, messages.salesmanBookingUpdated, booking);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message );
  }
};

// Delete salesman booking
export const deletesalesmanBooking = async (req: Request, res: Response): Promise<void> => {   
    try {
        const { id } = req.params;

        // Find the salesman booking  by ID
        const salesmanBooking = await salesmanBookingModel.findById(id);
        if (!salesmanBooking) {
            sendResponse(res, res.statusCode, false, messages.salesmanNotFound);
            return;
        }

        // Delete the salesman booking
        await salesmanBookingModel.findByIdAndDelete(id);

        // Send success response
        sendResponse(res, res.statusCode, true, messages.salesmanBookingDelete);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}

// Get all salesman booking
export const getAllSalesmanBooking = async (req: Request, res: Response): Promise<void> => {          
    try {
        // Fetch all salesman booking
        const salesmanBooking = await salesmanBookingModel.find();

        // Send success response
        sendResponse(res, res.statusCode, true, messages.salesmanBookingRetrieved, salesmanBooking);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}

// Get a salesman booking by ID
export const getsalesmanBookingId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the salesman booking by ID
        const salesmanBooking = await salesmanBookingModel.findById(id);
        if (!salesmanBooking) {
            sendResponse(res, res.statusCode, false, messages.salesmanNotFound);
            return;
        }

        // Send success response
        sendResponse(res, res.statusCode, true, messages.salesmanBookingRetrieved, salesmanBooking);
    } catch (error: any) {
        sendResponse(res, error.statusCode, false, error.message);
    }
}


