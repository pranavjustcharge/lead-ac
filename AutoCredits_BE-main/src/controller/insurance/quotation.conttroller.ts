// create Quotation Details
import { Request, Response } from "express";
import QuotationDetails, { IQuotationDetails } from "../../model/insurance/quotation.details.model"; 
import { sendResponse } from "../../utils/response"; 
import {messages} from "../../constants/insurance"; 
import mongoose from "mongoose";
import cache from "../../utils/chache";

// Create Quotation Details
export const createQuotationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      leadId,
      userId,
      CoverageType,
      policyDuration,
      vehicleValue,
      add_ons,
      createdBy,
      updatedBy,
    }: IQuotationDetails = req.body;

    if (!userId) {
      sendResponse(res, res.statusCode, false, messages.userIdRequired);
      return;
    }

    if (!leadId) {
      sendResponse(res, res.statusCode, false, messages.leadIdRequired);
      return;
    }

    // Build object
    const quotationData = {
      leadId: new mongoose.Types.ObjectId(leadId),
      userId: new mongoose.Types.ObjectId(userId),
      CoverageType,
      policyDuration,
      vehicleValue,
      add_ons,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to cache only (adjust this if you plan to persist later)
    const cacheKey = `quotationDetails:user:${userId}`;
    cache.set(cacheKey, quotationData);

    console.log("Cached Quotation Data:", cache.get(cacheKey));

    sendResponse(res, res.statusCode, true, messages.quotationCreated, quotationData);
  } catch (error: any) {
    console.error("Error caching quotation details:", error);
    sendResponse(res, error.statusCode , false, error.message);
  }
};

// Get Quotation Details by userId
export const getQuotationDetailsFromCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `quotationDetails:user:${userId}`;
  const data = cache.get(cacheKey);

  if (!data) {
    sendResponse(res, res.statusCode, false, messages.quotationNotFound);
    return;
  }

  sendResponse(res, res.statusCode, true, messages.quotationRetrieved, data);
};
 
// Update Quotation Details
export const updateQuotationDetailsInCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `quotationDetails:user:${userId}`;
  const existingData = cache.get(cacheKey);

  if (!existingData) {
    sendResponse(res, res.statusCode, false, messages.quotationNotFound);
    return;
  }

  const updatedData = {
    ...existingData,
    ...req.body,
    updatedAt: new Date()
  };

  cache.set(cacheKey, updatedData); 

  sendResponse(res, res.statusCode, true, messages.quotationUpdated, updatedData);
};


//Get all Quotation from db
export const getAllQuotationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 10;
       const skip = (page - 1) * limit;

    const quotationDetails = await QuotationDetails.find().sort({createdAt: -1}).skip(skip).limit(limit);

    const total = await QuotationDetails.countDocuments();

    sendResponse(res, res.statusCode, true, messages.quotationRetrieved, {
          data: quotationDetails,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};


//Get Quotation by id from db
export const getQuotationDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidVehicleId);
      return;
    }
    const quotatinDetails = await QuotationDetails.findById(id);
    if (!quotatinDetails) {
      sendResponse(res, res.statusCode, false, messages.quotationNotFound);
      return;
    }
    sendResponse(res, res.statusCode, true, messages.quotationRetrieved, quotatinDetails);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//Delete Quotation by id from db
export const deleteQuotationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidVehicleId);
      return;
    }
    const deletedQuotationDetails = await QuotationDetails.findByIdAndDelete(id);
    if (!deletedQuotationDetails) {
      sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
      return;
    }
    sendResponse(res, res.statusCode, true, messages.quotationDeleted, deletedQuotationDetails);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};
