import { Request, Response } from "express";
import { ICaseDetails } from "../../model/insurance/case.details.model"; 
import { sendResponse } from "../../utils/response"; 
import { messages } from "../../constants/insurance"; 
import { InvalidPhoneError } from "../../errors/lead.error";
import { isValidPhone } from "../../utils/validator";
import mongoose from "mongoose";
import cache from "../../utils/chache";


//Create Case Details
export const createCaseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      leadId,
      buyerName,
      mobileNumber,
      buyerType,
      insuranceCategory,
      source,
      status,
      followUp,
      assignTo,
      comment,
      createdBy,
      updatedBy
    }: ICaseDetails = req.body;

    // Validate phone number
    if (!isValidPhone(mobileNumber)) {
      throw new InvalidPhoneError();
    }

    // Build the case data object
    const caseData = {
      leadId: new mongoose.Types.ObjectId(leadId),
      userId: new mongoose.Types.ObjectId(userId),
      buyerName,
      mobileNumber,
      buyerType,
      insuranceCategory,
      source,
      status,
      followUp,
      assignTo,
      comment,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use userId as cache key
    const cacheKey = `caseDetails:user:${userId}`;
    cache.set(cacheKey, caseData);

    console.log("Cached case data for user:", cache.get(cacheKey));

    sendResponse(res, res.statusCode, true, messages.caseCreated, caseData);
  } catch (error: any) {
    console.error("Error in createCaseDetails:", error);
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// Update Case Details
export const updateCaseDetailsInCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `caseDetails:user:${userId}`;
  const existingData = cache.get(cacheKey);

  if (!existingData) {
    sendResponse(res, res.statusCode, false, messages.caseNotFound);
    return;
  }

  // Merge existing data with new incoming updates
  const updatedData = {
    ...existingData,
    ...req.body,
    updatedAt: new Date()
  };

  // Save updated data back to cache (same TTL)
  cache.set(cacheKey, updatedData);

  sendResponse(res, res.statusCode, true, messages.caseUpdated, updatedData);
};

// Get Case Details by case ID
export const getCaseDetailsFromCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `caseDetails:user:${userId}`;
  const data = cache.get(cacheKey);

  if (!data) {
    sendResponse(res, res.statusCode, false, messages.caseNotFound);
    return;
  }

  sendResponse(res, res.statusCode, true, messages.caseRetrieved, data);
};



















// // Delete Case Details by case ID
// export const deleteCaseDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;  
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidCaseId);
//       return;
//     } 
//     const caseDetails = await CaseDetails.findByIdAndDelete(id);
//     if (!caseDetails) {
//       sendResponse(res, res.statusCode, false, messages.caseNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.caseDeleted);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// // Get all Case Details
// export const getAllCaseDetails = async (_req: Request, res: Response): Promise<void> => {
//   try {
//     const caseDetails = await CaseDetails.find().sort({ createdAt: -1 });
//     sendResponse(res, res.statusCode, true, messages.casesRetrieved, caseDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// export const createCaseDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId,leadId, buyerName, mobileNumber, buyerType, insuranceCategory, source, status, followUp, assignTo, comment, createdBy, updatedBy }: ICaseDetails = req.body;

//     if (!isValidPhone(mobileNumber)) {
//       throw new InvalidPhoneError();
//     }

//     const newCaseDetails = new CaseDetails({
//       leadId: new mongoose.Types.ObjectId(leadId),
//       userId: new mongoose.Types.ObjectId(userId),
//       buyerName,
//       mobileNumber,
//       buyerType,
//       insuranceCategory,
//       source,
//       status,
//       followUp,
//       assignTo,
//       comment,
//       createdBy,
//       updatedBy,
//     });

//     const data = await newCaseDetails.save();
//     // Save to cache
//     const cacheKey = `caseDetails:${data._id}`;
//     cache.set(cacheKey, data);

//     // Log to check
//     console.log("Cached Data:", cache.get(cacheKey));

//     sendResponse(res, res.statusCode, true, messages.caseCreated, data);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message );
//   }
// };


// export const updateCaseDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const updateData: Partial<ICaseDetails> = req.body;

//     if (!id) {
//       sendResponse(res, res.statusCode, false, messages.caseIdRequired);
//       return;
//     }

//     const updatedCase = await CaseDetails.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedCase) {
//       sendResponse(res, res.statusCode, false, messages.caseNotFound);
//       return;
//     }

//     sendResponse(res, res.statusCode, true, messages.caseUpdated, updatedCase);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode , false, error.message );
//   }
// };


// export const getCaseDetailsById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidCaseId);
//       return;
//     }
//     const caseDetails = await CaseDetails.findById(id);
//     if (!caseDetails) {
//       sendResponse(res, res.statusCode, false, messages.caseNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.caseRetrieved, caseDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };