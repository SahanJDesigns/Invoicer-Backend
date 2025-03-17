import mongoose, { type Document, Schema } from "mongoose"

export interface IShop extends Document {
  shopName: string
  doctorName: string
  location: string
  contactNumber: string
  createdBy: mongoose.Types.ObjectId
}

const ShopSchema = new Schema(
  {
    shopName: {
      type: String,
      required: [true, "Please provide a shop name"],
      trim: true,
      maxlength: [100, "Shop name cannot be more than 100 characters"],
    },
    doctorName: {
      type: String,
      required: [true, "Please provide a doctor name"],
      trim: true,
      maxlength: [100, "Doctor name cannot be more than 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Please provide a contact number"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model<IShop>("Shop", ShopSchema)

