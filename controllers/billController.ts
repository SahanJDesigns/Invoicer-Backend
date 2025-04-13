import type { Request, Response, NextFunction } from "express"
import Bill from "../models/Bill"
import Shop from "../models/Shop"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"
import mongoose from "mongoose"
import Payment from "../models/Payment"

// Create a new bill
export const createBill = async (req: Request, res: Response) => {
  try {
    
    const { shopId, products } = req.body
    
    // Validate shop
    console.log(`User:${req.userId} is trying to Create a Biil for Shop:${shopId} with products:${products}`)
    const shop = await Shop.findById(shopId)
    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new ApiError(400, "Please provide at least one product")
    }

    // Process products
    const productItems = []
    let totalAmount = 0

    for (const item of products) {
      const product = await Product.findById(item.product)
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`)
      }

      const quantity = item.quantity || 1
      const itemTotal = product.price * quantity

      productItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      })

      totalAmount += itemTotal
    }

    // Create bill
    const bill = await Bill.create({
      shop: shop._id,
      shopName: shop.shopName,
      doctorName: shop.doctorName,
      products: productItems,
      payments: [],
      status: "Unpaid",
      totalAmount,
      currentPayment: 0,
      createdBy: req.userId,
    })
    console.log(`Bill successfully created for Shop:${shopId} with products:${products}`)
    res.status(201).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(`Bill creation failed for Shop:${req.body.shopId}, products:${req.body.products} with error:${error}`)
  }
}

// Search bills
export const searchBills = async (req: Request, res: Response) => {
  try {
    const { query } = req.query
    console.log(`User:${req.userId} is trying to search bills with query:${query}`)
    if (!query) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      })
      return
    }

    const bills = await Bill.find({
      $or: [
        { shopName: { $regex: query, $options: "i" } },
        { doctorName: { $regex: query, $options: "i" } },
        { invoiceNumber: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 })
    console.log(`User:${req.userId} successfully searched bills with query:${query}`)
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to search bills with query:${req.query} with error:${error}`)
  }
}

// Get a single bill
export const getBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.billId).populate("createdBy", "name").populate("shop").populate("payments")
    console.log(`User:${req.userId} is trying to get bill with ID:${req.params.billId}`)
    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    res.status(200).json({
      success: true,
      data: bill,
    })
    console.log(`User:${req.userId} successfully got bill with ID:${req.params.billId}`)
  } catch (error) {
    console.log(`User:${req.userId} failed to get bill with ID:${req.params.billId} with error:${error}`)
  }
}


// Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.billId)
    console.log(`User:${req.userId} is trying to delete bill with ID:${req.params.billId}`)
    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    // Check if user is creator or admin
    if (bill.createdBy.toString() !== req.userId && req.user?.role !== "admin") {
      throw new ApiError(403, "Not authorized to delete this bill")
    }

    await bill.deleteOne()
    console.log(`User:${req.userId} successfully deleted bill with ID:${req.params.billId}`)
    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to delete bill with ID:${req.params.id} with error:${error}`)
  }
}

export const addBillPayement = async (req: Request, res: Response) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { amount } = req.body

    console.log(`User:${req.userId} is trying to add payment to bill with ID:${req.params.id} with amount:${amount}`)

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Please provide a valid amount")
    }

    const payment = await Payment.create([{ 
      amount, 
      bill: req.params.billId 
    }], { session })

    const bill = await Bill.findById(req.params.billId).session(session)

    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    bill.payments.push(payment[0]._id as mongoose.Types.ObjectId)

    bill.currentPayment = bill.currentPayment + amount
    if (bill.currentPayment > bill.totalAmount) {
      throw new ApiError(400, "Payment amount exceeds total amount")
    } else if (bill.totalAmount === bill.currentPayment) {
      bill.status = "Paid"
    }

    await bill.save({ session })
    await session.commitTransaction()
    session.endSession()

    console.log(`User:${req.userId} successfully added payment to bill with ID:${req.params.id} with amount:${amount}`)
    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    console.log(`User:${req.userId} failed to add payment to bill with ID:${req.params.id} with amount:${req.body.amount} with error:${error}`)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


export const deletePayment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId } = req.params;

    console.log(`User:${req.userId} is trying to delete payment with ID:${paymentId}`);

    const payment = await Payment.findById(paymentId).session(session) as { _id: mongoose.Types.ObjectId, amount: number, bill: mongoose.Types.ObjectId };

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    const bill = await Bill.findById(payment.bill).session(session);

    if (!bill) {
      throw new ApiError(404, "Associated bill not found");
    }

    // Remove payment from bill
    bill.payments = bill.payments.filter(
      (id) => id.toString() !== (payment._id as mongoose.Types.ObjectId).toString()
    );

    bill.currentPayment -= payment.amount;

    if (bill.currentPayment < bill.totalAmount) {
      bill.status = "Unpaid";
    }

    await bill.save({ session });
    await Payment.deleteOne({ _id: payment._id }, { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`User:${req.userId} successfully deleted payment with ID:${paymentId}`);
    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.log(`User:${req.userId} failed to delete payment with ID:${req.params.paymentId} with error:${error}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
