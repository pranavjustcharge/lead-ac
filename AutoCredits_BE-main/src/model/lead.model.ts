import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  gender: "MALE" | "FEMALE";
  address: string;
  leadSource: "WEBSITE" | "SOCIAL_MEDIA" | "PARTNERSHIP" | "ONLINE" | "AGGREGATORS" | "OTHERS";
  leadStatus: "HOT" | "COLD" | "WARM" | "NOT_QUALIFIED" | "IN_PROGRESS" | "FOLLOW_UP_REQUEST" | "CONVERTED";
  rating: string;
  alternativeNumber: string;
  alternativeEmail: string;
  occupation: string;
  typeOfService: "FINANCE" | "USED_CAR" | "LOAN" | "INSURANCE";
  policyType: "2_Wheeler" | "4_Wheeler" | "HOME" | "HEALTH" | "LIFE";
  annual_income: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  createdBy: string;
  updatedBy: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    referenceNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["MALE", "FEMALE"], required: true },
    address: { type: String },

    leadSource: { 
      type: String, 
      enum: ["WEBSITE", "SOCIAL_MEDIA", "PARTNERSHIP", "ONLINE", "AGGREGATORS", "OTHERS"], 
      required: true 
    },
    leadStatus: { 
      type: String, 
      enum: ["HOT", "COLD", "WARM", "NOT_QUALIFIED", "IN_PROGRESS", "FOLLOW_UP_REQUEST", "CONVERTED"], 
      required: true 
    },

    rating: { type: String },
    alternativeNumber: { type: String },
    alternativeEmail: { type: String },
    occupation: { type: String },

    typeOfService: { 
      type: String, 
      enum: ["FINANCE", "USED_CAR", "LOAN", "INSURANCE"], 
      required: true 
    },
    policyType: { 
      type: String, 
      enum: ["2_Wheeler", "4_Wheeler", "HOME", "HEALTH", "LIFE"] , default: null
    },

    annual_income: { type: String, default: null },
    panNumber: { type: String, default: null },
    aadharNumber: { type: String, default: null },
    gstNumber: { type: String, default: null },

    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    tenantId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILead>("Lead", LeadSchema);
