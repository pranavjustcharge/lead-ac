import mongoose, { Schema, Document } from "mongoose";

export interface ISales extends Document {
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const SalesSchema = new Schema<ISales>(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "CLOSED"], required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ISales>("Sales", SalesSchema);
