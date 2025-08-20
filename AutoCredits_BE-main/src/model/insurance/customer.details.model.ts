import mongoose, { Schema, model, models, Document } from 'mongoose';
export interface ICustomerDetails extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;  
  address: string;
  city: string;
  pincode: Number;
  gender: "MALE" | "FEMALE";
  maritalStatus: "SINGLE" | "MARRIED";
  dob: string;
  occupation: "GOVT" | "PRIVATE";
  annualIncome: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  nomineeName: string;
  nomineeAge: string;
  nomineeRelation: "BROTHER" | "SISTER" | "MOTHER" | "FATHER";
  referenceName: string;
  referencePhoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE"], required: true },
    maritalStatus: { type: String, enum: ["SINGLE", "MARRIED"], required: true },
    dob: { type: String, required: true },
    occupation: { type: String, enum: ["GOVT", "PRIVATE"] },
    annualIncome: { type: String, required: true },
    panNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    gstNumber: { type: String, required: true },
    nomineeName: { type: String, required: true },
    nomineeAge: { type: String, required: true },
    nomineeRelation: { type: String, enum: ["BROTHER", "SISTER", "MOTHER", "FATHER" ], required: true },
    referenceName: { type: String, required: true },
    referencePhoneNumber: {type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const CustomerDetailsModel = models.CustomerDetails || model<ICustomerDetails>('CustomerDetails', CustomerDetailsSchema);
export default mongoose.model<ICustomerDetails>("CustomerDetails", CustomerDetailsSchema);

