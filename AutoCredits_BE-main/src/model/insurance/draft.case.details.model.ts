import mongoose, {Schema, Document, StringExpressionOperatorReturningArray} from "mongoose";
export interface IDraftCaseDetails extends Document {
  leadId: mongoose.Types.ObjectId;
  buyerName: string;  
  mobileNumber: string;
  buyerType: "INDIVIDUAL" | "COMPANY";
  insuranceCategory: "NEW_CAR" | "OLD_CAR";
  source: "DEALER" | "NOT_DEALER";
  status: "CONVERTED" | "FOLLOW_UP";
  followUp: Date;
  assignTo: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const IDraftCaseDetailsSchema = new Schema<IDraftCaseDetails>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    buyerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    buyerType: { type: String, enum: ["INDIVIDUAL", "COMPANY"], required: true },
    insuranceCategory: { type: String,enum: ["NEW_CAR", "OLD_CAR"], required: true },
    source: { type: String, enum: ["DEALER", "NOT_DEALER"], required: true },
    status: { type: String, enum: ["CONVERTED", "FOLLOW_UP"], required: true },
    followUp: { type: Date, required: true },
    assignTo: {type: String, required: true },
    comment: { type: String, required: true }, 
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<IDraftCaseDetails>("DraftCaseDetails", IDraftCaseDetailsSchema);

