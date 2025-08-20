import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IVehDetails extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationNumber: string;  
  make: "MARUTI" | "SUZUKI";
  modelName: "SWIFT" | "SWIFT2";
  variant: "VX1" | "VZ2";
  engineNumber: String;
  chassisNumber: String;
  makeMonthYear: String;
  registrationMonthYear: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const VehicleDetailsSchema = new Schema<IVehDetails>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    registrationNumber: { type: String, required: true },
    make: { type: String, enum: ["MARUTI", "SUZUKI"], required: true },
    modelName: { type: String, enum: ["SWIFT", "SWIFT2"], required: true },
    variant: { type: String, enum: ["VX1", "VZ2"], required: true },
    engineNumber: { type: String, required: true },
    chassisNumber: { type: String, required: true },
    makeMonthYear: { type: String, required: true },
    registrationMonthYear: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const VehiclesDetailsModel = models.CustomerDetails || model<IVehDetails>('VehicleDetails', VehicleDetailsSchema);

export default mongoose.model<IVehDetails>("VehicleDetails", VehicleDetailsSchema);
