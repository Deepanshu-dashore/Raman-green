import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    logoutAt: {
      type: Date,
      required: false,
    },
    loginAt: {
      type: Date,
      required: false,
    },
    image: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const Customer = models.Customer || model("Customer", CustomerSchema);
export default Customer;