import mongoose, {Schema, Document} from "mongoose";
import {ISales} from "./sales.model";
export interface ISalesManBooking extends Document {
  salesmanName: string,
  bookingTime: Date; 
  notes: string; 
  createdBy: string;
  updatedBy: string; 
  createdAt: Date; // Timestamp when the follow-up was created
  updatedAt: Date; // Timestamp when the follow-up was last updated
}

const SalesManBookingSchema = new Schema<ISalesManBooking>(
  {
    salesmanName: { type: String, required: true },
    bookingTime: { type: Date, required: true },
    notes: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<ISalesManBooking>("SalesmanBooking", SalesManBookingSchema);