import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IDocumentsUpload extends Document {
  uploadDocument:  string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const DocumentsUploadSchema = new Schema<IDocumentsUpload>(
  {
    uploadDocument: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<IDocumentsUpload>("DocumentsUpload", DocumentsUploadSchema);

