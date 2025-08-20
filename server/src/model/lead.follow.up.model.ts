import mongoose, {Schema, Document} from "mongoose";
import {ILead} from "./lead.model";
export interface ILeadFollowUp extends Document {
  leadId: mongoose.Types.ObjectId; 
  staffMember: "ADMIN" | "MANAGER" | "MEMBER";
  followUpDate: Date; 
  followUpStatus: "PENDING" | "COMPLETED" | "CANCELLED"; 
  notes: string; 
  createdBy: string;
  updatedBy: string; 
  createdAt: Date; 
  updatedAt: Date; 
}

const LeadFollowUpSchema = new Schema<ILeadFollowUp>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    staffMember: {
      type: String,
      enum: ["ADMIN", "MANAGER", "MEMBER"],
      required: true
    },
    followUpDate: { type: Date, required: true },
    followUpStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      required: true
    },
    notes: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<ILeadFollowUp>("LeadFollowUp", LeadFollowUpSchema);