// create Vehicle Details
import { Request, Response } from "express";
import { IVehDetails } from "../../model/insurance/vehicles.details.model"; 
import  VehicleDetails from "../../model/insurance/vehicles.details.model";
import { sendResponse } from "../../utils/response"; 
import {messages} from "../../constants/insurance"; 
import mongoose from "mongoose";
import cache from "../../utils/chache";

// Create Vehicle Details in cache
export const createVehicleDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      leadId,
      userId,
      registrationNumber,
      make,
      modelName,
      variant,
      engineNumber,
      chassisNumber,
      makeMonthYear,
      registrationMonthYear,
      createdBy,
      updatedBy,
    }: IVehDetails = req.body;

    if (!userId) {
      sendResponse(res, res.statusCode, false, messages.userIdRequired);
      return;
    }

    // Build object
    const vehicleData = {
      leadId: new mongoose.Types.ObjectId(leadId),
      userId: new mongoose.Types.ObjectId(userId),
      registrationNumber,
      make,
      modelName,
      variant,
      engineNumber,
      chassisNumber,
      makeMonthYear,
      registrationMonthYear,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to cache only
    const cacheKey = `vehicleDetails:user:${userId}`;
    cache.set(cacheKey, vehicleData); 

    // Optional: log cached data
    console.log("Cached Vehicle Data:", cache.get(cacheKey));

    sendResponse(res, res.statusCode, true, messages.vehicleCreated, vehicleData);
  } catch (error: any) {
    console.error("Error caching vehicle details:", error);
    sendResponse(res, error.statusCode, false, error.message);
  }
};

// Get Vehicle Details by userId from sync cache
export const getVehicleDetailsFromCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `vehicleDetails:user:${userId}`;
  const data = cache.get(cacheKey);

  if (!data) {
    sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
    return;
  }

  sendResponse(res, res.statusCode, true, messages.vehicleRetrieved, data);
};
 
// Update Vehicle Details in sync cache
export const updateVehicleDetailsInCache = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    sendResponse(res, res.statusCode, false, messages.userIdRequired);
    return;
  }

  const cacheKey = `vehicleDetails:user:${userId}`;
  const existingData = cache.get(cacheKey);

  if (!existingData) {
    sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
    return;
  }

  const updatedData = {
    ...existingData,
    ...req.body,
    updatedAt: new Date()
  };

  cache.set(cacheKey, updatedData); 

  sendResponse(res, res.statusCode, true, messages.vehicleUpdated, updatedData);
};


 //Get All Vehicles from db
export const getAllVehicleDetails = async (req: Request, res: Response): Promise<void> => {
  try {
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 10;
       const skip = (page - 1) * limit;

    const vehicleDetails = await VehicleDetails.find().sort({createdAt: -1}).skip(skip).limit(limit);

    const total = await VehicleDetails.countDocuments();

    sendResponse(res, res.statusCode, true, messages.vehiclesRetrieved, {
          data: vehicleDetails,
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


//Get Vehicle by id from db
export const getVehicleDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, res.statusCode, false, messages.invalidVehicleId);
      return;
    }
    const vehicleDetails = await VehicleDetails.findById(id);
    if (!vehicleDetails) {
      sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
      return;
    }
    sendResponse(res, res.statusCode, true, messages.vehicleRetrieved, vehicleDetails);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};




















// Delete Vehicle Details
// export const deleteVehicleDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidVehicleId);
//       return;
//     }
//     const deletedVehicleDetails = await VehicleDetails.findByIdAndDelete(id);
//     if (!deletedVehicleDetails) {
//       sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.vehicleDeleted, deletedVehicleDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// Get all Vehicle Details
// export const getAllVehicleDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const vehicleDetails = await VehicleDetails.find();
//     sendResponse(res, res.statusCode, true, messages.vehiclesRetrieved, vehicleDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };

// export const createVehicleDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       leadId,
//       userId,
//       registrationNumber,
//       make,
//       modelName,
//       variant,
//       engineNumber,
//       chassisNumber,
//       makeMonthYear,
//       registrationMonthYear,
//       createdBy,
//       updatedBy,
//     }: IVehDetails = req.body;

//     const newVehicleDetails = new VehicleDetails({
//       leadId: new mongoose.Types.ObjectId(leadId),
//       userId: new mongoose.Types.ObjectId(userId),
//       registrationNumber,
//       make,
//       modelName,
//       variant,
//       engineNumber,
//       chassisNumber,
//       makeMonthYear,
//       registrationMonthYear,
//       createdBy,
//       updatedBy,
//     });

//     const data = await newVehicleDetails.save();
//     // Save to cache
//     const cacheKey = `caseDetails:${data._id}`;
//     cache.set(cacheKey, data);

//     // Log to check
//     console.log("Cached Data:", cache.get(cacheKey));

//     sendResponse(res, res.statusCode, true, messages.vehicleCreated, data);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message );
//   }
// };

// export const updateVehicleDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const updateData: Partial<IVehDetails> = req.body;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       sendResponse(res, res.statusCode, false, messages.invalidVehicleId);
//       return;
//     }
//     const updatedVehicleDetails = await VehicleDetails.findByIdAndUpdate(
//       id,
//       updateData, 
//       { new: true, runValidators: true }
//     );
//     if (!updatedVehicleDetails) {
//       sendResponse(res, res.statusCode, false, messages.vehicleNotFound);
//       return;
//     }
//     sendResponse(res, res.statusCode, true, messages.vehicleUpdated, updatedVehicleDetails);
//   } catch (error: any) {
//     sendResponse(res, error.statusCode, false, error.message);
//   }
// };



