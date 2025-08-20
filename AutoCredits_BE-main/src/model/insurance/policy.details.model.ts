import mongoose, {Schema, Document, StringExpressionOperatorReturningArray} from "mongoose";
export interface IPolicyDetails extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  insuranceCompany:  "ICICI" | "HDFC";
  branch:  "SECTOR_40" | "SECTOR_42";
  policyType: "COMPREHENSIVE" | "THIRD_PARTY";
  policyNumber: string;
  issueDate: string;
  dueDate: string;
  ncbDiscount: "15%" | "30%" | "45%";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const IPolicyDetailsSchema = new Schema<IPolicyDetails>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    insuranceCompany: { type: String, enum: ["ICICI", "HDFC"], required: true },
    branch: { type: String, enum: ["SECTOR_40","SECTOR_42"], required: true },
    policyType: { type: String, enum: ["COMPREHENSIVE", "THIRD_PARTY"], required: true },
    policyNumber: { type: String, required: true },
    issueDate: { type: String,  required: true },
    dueDate: { type: String, required: true },
    ncbDiscount: { type: String, enum: ["15%","30%","45%"], required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<IPolicyDetails>("PolicyDetails", IPolicyDetailsSchema);

