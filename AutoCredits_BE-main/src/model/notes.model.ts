import mongoose, {Schema, Document} from "mongoose";
export interface INotes extends Document {
  notes: string;
  leadId: mongoose.Types.ObjectId; // reference of Lead table
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  tenantId: string;
}

const NotesSchema = new Schema<INotes>(
{
    notes: { type: String, required: true }, 
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    tenantId: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},
  { timestamps: true }
);
export default mongoose.model<INotes>("Notes", NotesSchema);
