import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name:string
}

const userSchema = new Schema<IUser>({
  name: {type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export interface UserResponse{
  email:string,
  name:string
}

export default model<IUser>('User', userSchema);

