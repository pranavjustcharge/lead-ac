import { Request, Response } from "express";
import CaseDetails from "../../model/insurance/case.details.model"; 
import CustomerDetails from "../../model/insurance/customer.details.model";
import PolicyDetails from "../../model/insurance/policy.details.model";
import VehicleDetails from "../../model/insurance/vehicles.details.model";
import QuotationDetails from "../../model/insurance/quotation.details.model";
import cache from "../../utils/chache";
import { sendResponse } from "../../utils/response"; 
import { messages } from "../../constants/insurance"; 

export const submitAllFormDetailsToDB = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired );
    return;
  }

  // Cache keys
  const caseCacheKey = `caseDetails:user:${userId}`;
  const customerCacheKey = `customerDetails:user:${userId}`;
  const policyCacheKey = `policyDetails:user:${userId}`;
  const vehicleCacheKey = `vehicleDetails:user:${userId}`;
  const quotationCacheKey = `quotationDetails:user:${userId}`;

  // Retrieve from cache
  const caseData = cache.get(caseCacheKey);
  const customerData = cache.get(customerCacheKey);
  const policyData = cache.get(policyCacheKey);
  const vehicleData = cache.get(vehicleCacheKey);
  const quotationData = cache.get(quotationCacheKey);

  // Validate
  if (!caseData ) {
    sendResponse(res, res.statusCode, false, "Case Details form sections are missing from cache");
    return;
  }else if(!customerData){
    sendResponse(res, res.statusCode, false, "Customer Details form sections are missing from cache");
    return;
  }else if(!policyData){
    sendResponse(res, res.statusCode, false, "Policy Details form sections are missing from cache");
    return;
  }else if(!vehicleData){
    sendResponse(res, res.statusCode, false, "Vehicles Details form sections are missing from cache");
    return;
  }else if(!quotationData){
    sendResponse(res, res.statusCode, false, "Quotation Details form sections are missing from cache");
    return;
  }else{
  
  try {
    // Save to DB
    const [caseResult, customerResult, policyResult, vehicleResult, quotationResult] = await Promise.all([
      new CaseDetails(caseData).save(),
      new CustomerDetails(customerData).save(),
      new PolicyDetails(policyData).save(),
      new VehicleDetails(vehicleData).save(),
      new QuotationDetails(quotationData).save()
    ]);

    // Clear cache
    cache.del([caseCacheKey, customerCacheKey, policyCacheKey, vehicleCacheKey, quotationCacheKey ]);
  
    // Respond
    sendResponse(res, res.statusCode, true, "All form details submitted successfully", {
      caseDetails: caseResult,
      customerDetails: customerResult,
      policyDetails: policyResult,
      vehicleDetails: vehicleResult,
      quotatinDetails: quotationResult 
    });
  
  } catch (error: any) {
    console.error("Error in final submission:", error);
    sendResponse(res, res.statusCode, false, error.message);
  }
}
};









// Get all form details
// export const getAllFormDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.query;

//     if (!id) {
//       sendResponse(res, 400, false, "User ID is required");
//       return;
//     }

//     const [caseData, customerData, policyData, vehicleData] = await Promise.all([
//       CaseDetails.find({ userId: id }),
//       CustomerDetails.find({ userId: id }),
//       PolicyDetails.find({ userId: id }),
//       VehicleDetails.find({ userId: id }),
//     ]);

//     const results = [caseData, customerData, policyData, vehicleData];

//     let stepCompleted: Record<string, boolean> = {};
//     let emptyStep: number | null = null;

//     for (let i = 0; i < results.length; i++) {
//       const stepKey = `step${i + 1}`;
//       const isCompleted = results[i].length > 0;
//       stepCompleted[stepKey] = isCompleted;

//       if (!isCompleted && emptyStep === null) {
//         emptyStep = i + 1;
//       }
//     }
//     sendResponse(res,res.statusCode,true,"Form steps status fetched successfully", { stepCompleted, emptyStep } );
//     return;

//   } catch (error) {
//     const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? (error as any).statusCode : 500;
//     const message = typeof error === "object" && error !== null && "message" in error ? (error as any).message : "Internal Server Error";
//     sendResponse(res, statusCode, false, message);
//   }
// };



export const getAllFormDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.query;

  if (!id) {
    sendResponse(res, res.statusCode, false, "User ID is required");
    return;
  }

  const cacheKey = `formSteps:${id}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    sendResponse(res, res.statusCode, true, "Form steps fetched from cache", cachedData);
    return;
  }

  // Fetch from DB as usual
  const [caseData, customerData, policyData, vehicleData] = await Promise.all([
    CaseDetails.find({ userId: id }),
    CustomerDetails.find({ userId: id }),
    PolicyDetails.find({ userId: id }),
    VehicleDetails.find({ userId: id }),
  ]);

  const results = [caseData, customerData, policyData, vehicleData];
  let stepCompleted: Record<string, boolean> = {};
  let emptyStep: number | null = null;

  for (let i = 0; i < results.length; i++) {
    const key = `step${i + 1}`;
    const hasData = results[i].length > 0;
    stepCompleted[key] = hasData;
    if (!hasData && emptyStep === null) emptyStep = i + 1;
  }

  const data = { stepCompleted, emptyStep };

  // Save to cache
  cache.set(cacheKey, data);
 
  // Log to check
   console.log("Cached Data:", cache.get(cacheKey));


  sendResponse(res, res.statusCode, true, "Form steps fetched successfully", data);
  return;
};




