import { Request, Response } from 'express';
import DocumentsUpload from '../../model/insurance/document.model';
import { sendResponse } from '../../utils/response'; 
import { messages } from '../../constants/insurance';

export const uploadDocumentController = async (req: Request, res: Response): Promise<void> => {
  try {
    
     // Check file presence
    if (!req.file) {
      sendResponse(res, res.statusCode, false, messages.noDocumentuploaded );
      return;
    }

    const { createdBy, updatedBy } = req.body;

    // Check for required fields
    if (!createdBy || !updatedBy) {
      sendResponse(res, res.statusCode, false, messages.createdByOrUpdatedByRequired);
      return;
    }

    // Create and save the document entry
    const newDocument = new DocumentsUpload({
      uploadDocument: req.file.filename,
      createdBy,
      updatedBy
    });

    await newDocument.save();

    sendResponse(res, res.statusCode, true, messages?.documentUploaded, newDocument);
  } catch (error: any) {
    sendResponse(res, error.statusCode , false, error.message);
  }
};
