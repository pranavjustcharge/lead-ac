import { Router } from "express";
import {  createCaseDetails, updateCaseDetailsInCache,  getCaseDetailsFromCache  } from "../../controller/insurance/case.details.controller";
import { createCustomerDetails, updateCustomerDetailsInCache, getCustomerDetailsFromCache,getAllCustomerDetails, getCustomerDetailsById  } from "../../controller/insurance/customer.details.controller";
import {createPolicyDetails, getPolicyDetailsFromCache, updatePolicyDetailsInCache, getAllPolicyDetails,getPolicyDetailsById } from "../../controller/insurance/policy.details.controller";
import { createVehicleDetails, updateVehicleDetailsInCache, getVehicleDetailsFromCache,getAllVehicleDetails,getVehicleDetailsById } from "../../controller/insurance/vehicles.details.controller";
import { createQuotationDetails, getAllQuotationDetails, getQuotationDetailsById, deleteQuotationDetails,getQuotationDetailsFromCache, updateQuotationDetailsInCache } from "../../controller/insurance/quotation.conttroller";
import { getAllFormDetails, submitAllFormDetailsToDB } from "../../controller/insurance/draft.case.details.controller";


const router = Router();

//case details routes
router.post("/case/cache",createCaseDetails);
router.put("/case/cache", updateCaseDetailsInCache);
router.get("/case/cache", getCaseDetailsFromCache);

//customer details routes
router.post("/customer/cache", createCustomerDetails);
router.put("/customer/cache", updateCustomerDetailsInCache);
router.get("/customer/cache", getCustomerDetailsFromCache);
router.get("/customer/db",getAllCustomerDetails);
router.get("/customer/db",getCustomerDetailsById);

//policy details routes
router.post("/policy/cache", createPolicyDetails);
router.put("/policy/cache", updatePolicyDetailsInCache);
router.get("/policy/cache", getPolicyDetailsFromCache);
router.get("/policy/db",getAllPolicyDetails);
router.get("/policy/db",getPolicyDetailsById);

//vehicle details routes
router.post("/vehicles/cache", createVehicleDetails);
router.put("/vehicles/cache", updateVehicleDetailsInCache);
router.get("/vehicles/cache", getVehicleDetailsFromCache);
router.get("/vehicles/db",getAllVehicleDetails);
router.get("/vehicle/db",getVehicleDetailsById);

//Quotation details routes
router.post("/quotation/cache", createQuotationDetails);
router.get("/quotation/cache", getQuotationDetailsFromCache);
router.put("/quotation/cache", updateQuotationDetailsInCache);
router.get("/quotation/db", getAllQuotationDetails);
router.get("/quotation/db",getQuotationDetailsById);
router.delete("/quotation/db", deleteQuotationDetails);


//get all form details
router.get("/form-details", getAllFormDetails);
router.post("/submit-form", submitAllFormDetailsToDB);



//draft case details routes
// router.post("/draft-case", createDraftCaseDetails);
// // router.put("/draft-case/:id", updateDraftCaseDetails);
// // router.get("/draft-case/:id", getDraftCaseDetailsById);
// // router.delete("/draft-case/:id", deleteDraftCaseDetails);
// // router.get("/draft-case", getAllDraftCaseDetails);
// router.post("/documents", uploadSingle, uploadDocumentController);
// router.post("/documents/multiple", uploadMultiple, uploadMultipleDocumentsController);

export default router;

