import { Schema, model, Document } from 'mongoose';

export interface ConstructionRequest extends Document {
  title: string;
  description: string;
  location: string;
  status:'Pending' | 'Completed' | 'Processing';
}

const constructionRequestSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  location: { type: String, required: false },
  status: { type: String, required: true }
});

export interface PaymentInfo {
    cardNumber : string;
    cvc:string;
    expiryDate:String;
}

export default model<ConstructionRequest>('ConstructionRequest', constructionRequestSchema);