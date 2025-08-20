import { Request, Response } from "express";
import Lead, { ILead } from "../model/lead.model";  
import { sendResponse } from "../utils/response";
import { messages } from "../constants/message";
import { InvalidEmailError, InvalidPhoneError } from "../errors/lead.error";
import { emailRegex,isValidPhone } from "../utils/validator";
import { generateReferenceNumber } from "../utils/referenceNumber";
import moment from 'moment';
import History, { IHistory } from '../model/history.model';  


//  create a new lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      dob,
      phone,
      email,
      gender,
      address,
      leadSource,
      leadStatus,
      rating,
      alternativeNumber,
      alternativeEmail,
      occupation,
      typeOfService,
      policyType,
      annual_income,
      panNumber,
      aadharNumber,
      gstNumber,
      createdBy,
      updatedBy,
      tenantId,
    }: ILead = req.body;

    if (!emailRegex.test(email)) {
      throw new InvalidEmailError();
    }

    if (!isValidPhone(phone)) {
      throw new InvalidPhoneError();
    }

    const referenceNumber = await generateReferenceNumber();

    const existingLead = await Lead.findOne({ email }); 
    if (existingLead) {
      sendResponse(res, res.statusCode, false, messages.duplicateEmail);
      return;
    }
  
    const newLead: ILead = new Lead({
      referenceNumber,
      firstName,
      lastName,
      dob,
      phone,
      email,
      gender,
      address,
      leadSource,
      leadStatus,
      rating,
      alternativeNumber,
      alternativeEmail,
      occupation,
      typeOfService,
      policyType,
      annual_income,
      panNumber,
      aadharNumber,
      gstNumber,
      createdBy,
      updatedBy,
      tenantId,
    });

    const savedLead = await newLead.save();


    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const newHistory = new History({
      leadId: savedLead._id,
      tenantId,
      actions: [
        {
          action: "Leads Started",
          details: `A new leads started by ${createdBy} on ${formattedDate}`,
          createdBy: createdBy,
          createdAt: now,
        },
      ],
    });

    await newHistory.save();

    const customMessage = `A new leads started by ${createdBy} on ${formattedDate}`;

    sendResponse(res, res.statusCode, true, customMessage, { lead: savedLead, history: newHistory });
  } catch (error: any) {
    const statusCode = error.statusCode;
    const message =
      error instanceof InvalidEmailError
        ? "Invalid Email Address"
        : error instanceof InvalidPhoneError
        ? "Invalid Phone Number"
        : error.message;

    sendResponse(res, statusCode, false, message);
  }
};

// Update an existing lead
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: Partial<ILead> = req.body;
    const { createdBy } = req.body;

    if (updateData.email && !emailRegex.test(updateData.email)) {
      throw new InvalidEmailError();
    }

    if (updateData.phone && !isValidPhone(updateData.phone)) {
      throw new InvalidPhoneError();
    }

    const updatedLead: ILead | null = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      sendResponse(res, res.statusCode, false, messages.userNotFound);
      return;
    }

    const now = new Date();
    const formattedDate = moment(now).format("DD-MM-YYYY hh:mm a");

    const action = {
      action: "Lead Updated",
      details: `A lead was updated by ${createdBy} on ${formattedDate}`,
      createdBy: createdBy || updatedLead.updatedBy,
      createdAt: now,
    };

    await History.findOneAndUpdate(
      { leadId: updatedLead._id },
      { 
        $push: { actions: action },
        $setOnInsert: { tenantId: updatedLead.tenantId } 
      },
      { new: true, upsert: true }
    );

    const responseData = {
      leadId: updatedLead._id,
      tenantId: updatedLead.tenantId,
      actions: [action]
    };

    sendResponse(res, res.statusCode, true, "Lead updated successfully", responseData);

  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.email) {
      await Lead.collection.dropIndex("email_1"); 
      sendResponse(res, res.statusCode, true, "Lead updated successfully (duplicate email allowed)");
      return;
    }

    const statusCode = error.statusCode;
    const message =
      error instanceof InvalidEmailError
        ? messages.invalidEmail
        : error instanceof InvalidPhoneError
        ? messages.invalidPhone
        : error.message;

    sendResponse(res, statusCode, false, message);
  }
};

// Get a lead by ID
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;

    const lead: ILead | null = await Lead.findById(id);
    
    if (!lead) {
      sendResponse(res, res.statusCode, false, messages.leadNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.getLead, lead);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error);
  }
}

// Get all leads
export const getAllLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const leads = await Lead.find().select('_id referenceNumber firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const formattedLeads = leads.map(lead => ({
      id: lead._id, 
      referenceNumber: lead.referenceNumber,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email
    }));

    const total = await Lead.countDocuments();

    sendResponse(res, res.statusCode, true, messages.getLead, {
      leads: formattedLeads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//filter leads by  leadStatus
export const filterLeadsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadStatus, typeOfService, page , limit } = req.body;

    const pageNumber = parseInt(req.query.page as string) || 1;
    const limitNumber = parseInt(req.query.limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build dynamic filter object
    const filter: any = {};
    if (leadStatus) {
      filter.leadStatus = leadStatus;
    }
    if (typeOfService) {
      filter.typeOfService = typeOfService;
    }

    // Return error if no filters are passed
    if (Object.keys(filter).length === 0) {
      sendResponse(res, res.statusCode, false, 'Please provide at least one filter (leadStatus or typeOfService).');
      return;
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber).exec(); //.select('firstName lastName email referenceNumber')

    const totalLeads = await Lead.countDocuments(filter);

    sendResponse(res, res.statusCode, true, messages.getLead, {
      leads,
      totalLeads,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalLeads / limitNumber),
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode , false, error.message );
  }
};

