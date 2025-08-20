import mongoose, { Schema, Document } from "mongoose";

interface IAction {
  action: string;
  details: string;
  createdAt: Date;
  createdBy: string;
}

export interface IHistory extends Document {
  leadId: mongoose.Types.ObjectId;
  tenantId: string;
  actions: IAction[];
}

const ActionSchema = new Schema<IAction>(
  {
    action: { type: String, required: true },
    details: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false } 
);

const HistorySchema = new Schema<IHistory>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true },
    tenantId: { type: String, required: true },
    actions: { type: [ActionSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model<IHistory>("History", HistorySchema);