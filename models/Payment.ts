import Mongoose, {type Document, Schema} from "mongoose";

export interface IPayment extends Document {
  amount: number;
  bill: Mongoose.Types.ObjectId;
  createdBy: Mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, "Please provide an amount"],
      min: [0, "Amount cannot be negative"],
    },
    bill: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
  },
  { timestamps: true },
);

export default Mongoose.model<IPayment>("Payment", PaymentSchema);