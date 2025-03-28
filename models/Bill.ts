import mongoose, { type Document, Schema } from "mongoose"

interface IProductItem {
  product: mongoose.Types.ObjectId
  name: string
  price: number
  quantity: number
}

export interface IBill extends Document {
  invoiceNumber: string
  shop: mongoose.Types.ObjectId
  shopName: string
  doctorName: string
  products: IProductItem[]
  totalAmount: number
  currentPayment: number
  status: "Paid" | "Unpaid"
  createdBy: mongoose.Types.ObjectId
  date: Date
  payments:mongoose.Types.ObjectId[]
}

const BillSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    currentPayment: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },

    payments:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    }],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Generate invoice number before saving
BillSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Bill").countDocuments()
    this.invoiceNumber = `INV-${String(count + 1).padStart(3, "0")}`
  }
  next()
})

export default mongoose.model<IBill>("Bill", BillSchema)

