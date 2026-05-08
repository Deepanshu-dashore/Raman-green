import { Schema, model, models, Document } from "mongoose";
import { hashPassword } from "../../security/password";

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string | null;
  role: 'customer' | 'admin';
  password?: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  password: {
    type: String,
    required: true,
    select: false
  }
},{timestamps: true});

userSchema.pre("save", async function (this: IUser, next: any) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hashPassword(this.password);
  next();
});

const User = models.User || model<IUser>("User", userSchema);

export default User;
