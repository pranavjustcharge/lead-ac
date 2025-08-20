import mongoose, {Schema, Document} from "mongoose";

export interface ILeadBooking extends Document {
  leadId: mongoose.Types.ObjectId;   
  typeOfService: "FINANCE" | "USED_CAR" | "LOAN" | "INSURANCE";
  bookingTime: Date; 
  notes: string; 
  createdBy: string;
  updatedBy: string; 
  createdAt: Date; // Timestamp when the follow-up was created
  updatedAt: Date; // Timestamp when the follow-up was last updated
}


const LeadBookingSchema = new Schema<ILeadBooking>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    typeOfService: { 
      type: String, 
      enum: ["FINANCE", "USED_CAR", "LOAN", "INSURANCE"], 
      required: true 
    },
    bookingTime: { type: Date, required: true },
    notes: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true } // Automatically handles createdAt and updatedAt
);

export default mongoose.model<ILeadBooking>("LeadBooking", LeadBookingSchema);

