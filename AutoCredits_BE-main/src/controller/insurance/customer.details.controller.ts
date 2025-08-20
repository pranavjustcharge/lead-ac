import { Request, Response } from "express";
import CustomerDetails, { ICustomerDetails } from "../../model/insurance/customer.details.model";
import { sendResponse } from "../../utils/response"; 
import { messages } from "../../constants/insurance"; 
import { InvalidEmailError, InvalidPhoneError } from "../../errors/lead.error";
import { emailRegex,isValidPhone } from "../../utils/validator";
import mongoose from "mongoose";
import cache from "../../utils/chache";


//create Customer Details from cache
export const createCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      leadId,
      userId,
      email,
      address,
      city,
      pincode,
      gender,
      maritalStatus,
      dob,
      occupation,
      annualIncome,
      panNumber,
      aadharNumber,
      gstNumber,
      nomineeName,
      nomineeAge,
      nomineeRelation,
      referenceName,
      referencePhoneNumber,
      createdBy,
      updatedBy,
    }: ICustomerDetails = req.body;

    // Validate
    if (!emailRegex.test(email)) throw new InvalidEmailError();
    if (!isValidPhone(referencePhoneNumber)) throw new InvalidPhoneError();

    // Optional: You can still check cache to prevent duplicates
    const existingCacheKey = `customerDetails:user:${userId}`;
    const existing = cache.get(existingCacheKey) as ICustomerDetails | undefined;
    if (existing?.email === email) {
      sendResponse(res, res.statusCode, false, messages.duplicateEmail);
      return;
    }

    // Create in-memory object
    const customerData = {
      leadId: new mongoose.Types.ObjectId(leadId),
      userId: new mongoose.Types.ObjectId(userId),
      email,
      address,
      city,
      pincode,
      gender,
      maritalStatus,
      dob,
      occupation,
      annualIncome,
      panNumber,
      aadharNumber,
      gstNumber,
      nomineeName,
      nomineeAge,
      nomineeRelation,
      referenceName,
      referencePhoneNumber,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to cache only
    const cacheKey = `customerDetails:user:${userId}`;
    cache.set(cacheKey, customerData); 

    console.log("Customer details cached:", cache.get(cacheKey));

    sendResponse(res, res.statusCode, true, messages.custmerCreated, customerData);
  } catch (error: any) {
    console.error("Error in createCustomerDetails:", error);
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// Update Customer Details from cache
export const updateCustomerDetailsInCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `customerDetails:user:${userId}`;
  const existingData = cache.get(cacheKey);

  if (!existingData) {
    sendResponse(res, res.statusCode, false, messages.customerDetailsNotFound);
    return;
  }

  const updatedData = {
    ...existingData,
    ...req.body,
    updatedAt: new Date(),
  };

  cache.set(cacheKey, updatedData); 

  sendResponse(res, res.statusCode, true, messages.customerUpdated, updatedData);
};

// Get Customer Details by userId from cache
export const getCustomerDetailsFromCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `customerDetails:user:${userId}`;
  const data = cache.get(cacheKey);

  if (!data) {
    sendResponse(res, res.statusCode, false, messages.customerDetailsNotFound);
    return;
  }

  sendResponse(res, res.statusCode, true, messages.customerRetrieved, data);
};


//Get All Customer from db
export const getAllCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const customerDetails = await CustomerDetails.find().sort({createdAt: -1}).skip(skip).limit(limit);

    const total = await CustomerDetails.countDocuments();

    sendResponse(res, res.statusCode, true, messages.customersRetrieved, {
      data: customerDetails,
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

//Get Customer by id from db
export const getCustomerDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidCustomerId);
      return;
    }
    const customerDetails = await CustomerDetails.findById(id); 
    if (!customerDetails) {
      sendResponse(res, res.statusCode, false, messages.customerNotFound);
      return;
    }
    sendResponse(res, res.statusCode, true, messages.customerRetrieved, customerDetails);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};



















// // Delete Customer Details
// export const deleteCustomerDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidCustomerId);
//       return;
//     }
//     const customerDetails = await CustomerDetails.findByIdAndDelete(id);
//     if (!customerDetails) {
//       sendResponse(res, res.statusCode, false, messages.customerNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.customerDeleted, customerDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };


// // Get all Customer Details


// export const updateCustomerDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const updateData: Partial<ICustomerDetails> = req.body;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidCustomerId);
//       return;
//     }
//     const updatedCustomer = await CustomerDetails.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedCustomer) {
//       sendResponse(res, res.statusCode, false, messages.customerNotFound);
//       return;
//     }

//     sendResponse(res, res.statusCode, true, messages.customerUpdated, updatedCustomer);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };



// export const createCustomerDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       leadId,
//       userId,
//       email,
//       address,
//       city,
//       pincode,
//       gender,
//       maritalStatus,
//       dob,
//       occupation,
//       annualIncome,
//       panNumber,
//       aadharNumber,
//       gstNumber,
//       nomineeName,
//       nomineeAge,
//       nomineeRelation,
//       referenceName,
//       referencePhoneNumber,
//       createdBy,
//       updatedBy,
//     }: ICustomerDetails = req.body;


//     if (!emailRegex.test(email)) {
//       throw new InvalidEmailError();
//     }

//     if (!isValidPhone(referencePhoneNumber)) {
//       throw new InvalidPhoneError();
//     }

//     const existingCustomer = await CustomerDetails.findOne({email });
//     if (existingCustomer) {
//       sendResponse(res, res.statusCode, false, messages.duplicateEmail);
//       return;
//     }

//     const newCustomerDetails = new CustomerDetails({
//       leadId: new mongoose.Types.ObjectId(leadId),
//       userId: new mongoose.Types.ObjectId(userId),
//       email,
//       address,
//       city,
//       pincode,
//       gender,
//       maritalStatus,
//       dob,
//       occupation,
//       annualIncome,
//       panNumber,
//       aadharNumber,
//       gstNumber,
//       nomineeName,
//       nomineeAge,
//       nomineeRelation,
//       referenceName,
//       referencePhoneNumber,
//       createdBy,
//       updatedBy,
//     });

//     const data = await newCustomerDetails.save();
//     // Save to cache
//         const cacheKey = `caseDetails:${data._id}`;
//         cache.set(cacheKey, data);
    
//         // Log to check
//         console.log("Cached Data:", cache.get(cacheKey));

//     sendResponse(res, 201, true, messages.custmerCreated, data);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };