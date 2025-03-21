import type { Request, Response, NextFunction } from "express"
import Bill from "../models/Bill"
import Shop from "../models/Shop"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"
import mongoose from "mongoose"

// Create a new bill
export const createBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopId, products } = req.body

    // Validate shop
    console.log(shopId)
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
      totalAmount,
      createdBy: req.userId,
    })

    res.status(201).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get all bills
export const getAllBills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, shopId, search } = req.query

    // Build query
    const query: any = {}

    if (status && (status === "Paid" || status === "Unpaid")) {
      query.status = status
    }

    if (shopId) {
      query.shop = shopId
    }

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ]
    }

    const bills = await Bill.find(query).sort({ date: -1 }).populate("createdBy", "name")

    res.status(200).json(
      {
        success: true,
        count: bills.length,
        data: bills,
      }
    )
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get a single bill
export const getBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("createdBy", "name").populate("shop")

    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    res.status(200).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Update bill status
export const updateBillStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body

    if (!status || (status !== "Paid" && status !== "Unpaid")) {
      throw new ApiError(400, "Please provide a valid status (Paid or Unpaid)")
    }

    const bill = await Bill.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })

    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    res.status(200).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Delete a bill
export const deleteBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bill = await Bill.findById(req.params.id)

    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    // Check if user is creator or admin
    if (bill.createdBy.toString() !== req.userId && req.user?.role !== "admin") {
      throw new ApiError(403, "Not authorized to delete this bill")
    }

    await bill.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get bills by shop
export const getBillsByShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName } = req.params
    console.log(shopName)
    const query: any = { shopName: { $regex: shopName, $options: "i" } }

    const bills = await Bill.find(query).sort({ date: -1 }).populate("createdBy", "name")

    res.status(200).json( 
      {
        success: true,
        count: bills.length,
        data: bills,
      }
    )
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getBillsByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctor } = req.params

    const query: any = { doctorName: { $regex: doctor, $options: "i" } }


    const bills = await Bill.find(query).sort({ date: -1 }).populate("createdBy", "name")

    res.status(200).json(
      {
        success: true,
        count: bills.length,
        data: bills,
      }
    )

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getBillByInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoice } = req.params
    const query: any = { invoiceNumber: { $regex: invoice, $options: "i" } }


    const bills = await Bill.find(query).sort({ date: -1 }).populate("createdBy", "name")

    res.status(200).json(
      {
        success: true,
        count: bills.length,
        data: bills,
      }
    )

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const addBillPayement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body
    console.log(req.userId)
    console.log(req.params.id)
    const user = req.user
    if (!amount || amount <= 0) {
      throw new ApiError(400, "Please provide a valid amount")
    }

    const bill = await Bill.findById(req.params.id)

    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    if (req.userId){
      bill.payments.push({
        amount,
        date: new Date(),
        createdBy: req.userId as unknown as mongoose.Types.ObjectId,
      })}
      console.log(bill.payments)
    bill.currentPayment = bill.payments.reduce((acc, item) => acc + item.amount, 0)
    if (bill.currentPayment > bill.totalAmount) {
      throw new ApiError(400, "Payment amount exceeds total amount")
    }else if (bill.totalAmount === bill.currentPayment) {
      bill.status = "Paid"
    }else{
      bill.currentPayment = bill.totalAmount - bill.currentPayment
    }

    await bill.save()

    res.status(200).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
