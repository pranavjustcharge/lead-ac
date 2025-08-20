import mongoose, {Schema, Document, StringExpressionOperatorReturningArray} from "mongoose";
export interface IQuotationDetails extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  CoverageType:  "Comprehensive" | "Third_Party";
  policyDuration: "1Year" | "2Year" | "3Year";
  vehicleValue: number;
  add_ons: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const IQuotationDetailsSchema = new Schema<IQuotationDetails>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    CoverageType: { 
      type: String, 
      enum: ["Comprehensive", "Third_Party"], 
      required: true 
    },
    policyDuration: {
      type: String,
      enum: ["1Year", "2Year", "3Year"],
      required: true
    },
    vehicleValue: { type: Number, required: true },
    add_ons: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IQuotationDetails>("QuotationDetails", IQuotationDetailsSchema);

