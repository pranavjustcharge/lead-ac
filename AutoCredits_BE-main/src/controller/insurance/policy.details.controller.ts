import { Request, Response } from "express";
import PolicyDetails, { IPolicyDetails } from "../../model/insurance/policy.details.model";  
import { sendResponse } from "../../utils/response"; 
import { messages } from "../../constants/insurance"; 
import mongoose from "mongoose";
import cache from "../../utils/chache";

//create Policy Details
export const createPolicyDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      leadId,
      userId,
      insuranceCompany,
      branch,
      policyType,
      policyNumber,
      issueDate,
      dueDate,
      ncbDiscount,
      createdBy,
      updatedBy,
    }: IPolicyDetails = req.body;


    // Create policy object in cache
    const policyData = {
      leadId: new mongoose.Types.ObjectId(leadId),
      userId: new mongoose.Types.ObjectId(userId),
      insuranceCompany,
      branch,
      policyType,
      policyNumber,
      issueDate,
      dueDate,
      ncbDiscount,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const cacheKey = `policyDetails:user:${userId}`;
    cache.set(cacheKey, policyData);

    console.log("Cached Policy Details:", cache.get(cacheKey));

    sendResponse(res, res.statusCode, true, messages.policyCreated, policyData);
  } catch (error: any) {
    console.error("Error caching policy details:", error);
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//get policy details by user id
export const getPolicyDetailsFromCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `policyDetails:user:${userId}`;
  const data = cache.get(cacheKey);

  if (!data) {
    sendResponse(res, res.statusCode, false, messages.policyNotFound);
    return;
  }

  sendResponse(res, res.statusCode, true, messages.policiesRetrieved, data);
};

// Update policy details by user id
export const updatePolicyDetailsInCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `policyDetails:user:${userId}`;
  const existingData = cache.get(cacheKey);

  if (!existingData) {
    sendResponse(res, res.statusCode, false, messages.policyNotFound);
    return;
  }

  const updatedData = {
    ...existingData,
    ...req.body,
    updatedAt: new Date()
  };

  cache.set(cacheKey, updatedData);

  sendResponse(res, res.statusCode, true, messages.policyUpdated, updatedData);
};


//Get all Policy details  from db
export const getAllPolicyDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    // Fetch data with pagination and sorting
    const policies = await PolicyDetails.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await PolicyDetails.countDocuments();

    if (policies.length === 0) {
      sendResponse(res, res.statusCode, false, messages.noPoliciesFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.policiesRetrieved, {
      data: policies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message );
  }
};

 
//Get Policy Details by policy id from db
export const getPolicyDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;  
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidId);
      return;
    }
    const policyDetails = await PolicyDetails.findById(id);
    if (!policyDetails) {
      sendResponse(res, res.statusCode, false, messages.policyNotFound);
      return;
    }
    sendResponse(res, res.statusCode, true, messages.policyRetrieved, policyDetails);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};


























// Delete policy details
// export const deletePolicyDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     // Validate id
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidId);
//       return;
//     }
//     const deletedPolicy = await PolicyDetails.findByIdAndDelete(id);
//     if (!deletedPolicy) {
//       sendResponse(res, res.statusCode, false, messages.policyNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.policyDeleted, deletedPolicy);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// Get all policy details
// export const getAllPolicyDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const policies = await PolicyDetails.find();
//     if (policies.length === 0) {
//       sendResponse(res, res.statusCode, false, messages.noPoliciesFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.policiesRetrieved, policies);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   } 
// };

// export const createPolicyDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       leadId,
//       userId,
//       insuranceCompany,
//       branch,
//       policyType,
//       policyNumber,
//       issueDate,
//       dueDate,
//       ncbDiscount,
//       createdBy,
//       updatedBy,
//     }: IPolicyDetails = req.body;

//     const newPolicyDetails = new PolicyDetails({
//       leadId: new mongoose.Types.ObjectId(leadId),
//       userId: new mongoose.Types.ObjectId(userId),
//       insuranceCompany,
//       branch,
//       policyType,
//       policyNumber,
//       issueDate,
//       dueDate,
//       ncbDiscount,
//       createdBy,
//       updatedBy,
//     });

//     const data = await newPolicyDetails.save();

//     // Save to cache
//     const cacheKey = `caseDetails:${data._id}`;
//     cache.set(cacheKey, data);

//     // Log to check
//     console.log("Cached Data:", cache.get(cacheKey));
    
//     sendResponse(res, res.statusCode, true, messages.policyCreated, data);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode , false, error.message);
//   }
// };

// export const updatePolicyDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const updateData: Partial<IPolicyDetails> = req.body;
//     // Validate id
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidId);
//       return;
//     }
//     const updatedPolicy = await PolicyDetails.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedPolicy) {
//       sendResponse(res, res.statusCode, false, messages.policyNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.policyUpdated, updatedPolicy);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// export const getPolicyDetailsById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;  
//     // Validate id
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidId);
//       return;
//     }
//     const policyDetails = await PolicyDetails.findById(id);
//     if (!policyDetails) {
//       sendResponse(res, res.statusCode, false, messages.policyNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.policyRetrieved, policyDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };