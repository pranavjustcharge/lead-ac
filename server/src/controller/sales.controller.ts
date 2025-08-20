import { Request, Response } from "express";
import SalesModel, { ISales } from "../model/sales.model"; 
import { sendResponse } from "../utils/response"; 
import { messages } from "../constants/message"; 


//create SalesMan
export const createSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, status, tenantId,  createdBy,
      updatedBy }: Partial<ISales> = req.body;

    const newSale = new SalesModel({ name, email, phone, status , tenantId,  createdBy,
      updatedBy });
    await newSale.save();

    sendResponse(res, res.statusCode, true, messages.saleCreated, newSale);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//Get all salesMan
export const getAllSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await SalesModel.find();
    sendResponse(res, res.statusCode, true, messages.salesRetrieved, sales);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//Get SalesMan by Id
export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sale = await SalesModel.findById(id);
    if (!sale) {
      sendResponse(res, res.statusCode, false, messages.saleNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.salesRetrieved, sale);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};

//Delete SalesMan 
export const deleteSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedSale = await SalesModel.findByIdAndDelete(id);
    if (!deletedSale) {
      sendResponse(res, res.statusCode, false, messages.saleNotFound);
      return;
    }

    sendResponse(res, res.statusCode, true, messages.saleDeleted);
  } catch (error: any) {
    sendResponse(res, error.statusCode, false, error.message);
  }
};



