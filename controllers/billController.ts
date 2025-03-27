import type { Request, Response, NextFunction } from "express"
import Bill from "../models/Bill"
import Shop from "../models/Shop"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"
import mongoose from "mongoose"

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
      totalAmount,
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

// Get all bills
export const hhhjh = async (req: Request, res: Response) => {
  try {
    const { status, shopId, search } = req.query
    console.log(`User:${req.userId} is trying to get all bills with status:${status}, shopId:${shopId}, search:${search}`)
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
    console.log(`User:${req.userId} successfully got all bills with status:${status}, shopId:${shopId}, search:${search}`)
    res.status(200).json(
      {
        success: true,
        count: bills.length,
        data: bills,
      }
    )
  } catch (error) {
    console.log(`User:${req.userId} failed to get all bills with error:${req.query.status} for shopId:${req.query.shopId}, search:${req.query.search}`)
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
    const bill = await Bill.findById(req.params.id).populate("createdBy", "name").populate("shop")
    console.log(`User:${req.userId} is trying to get bill with ID:${req.params.id}`)
    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    res.status(200).json({
      success: true,
      data: bill,
    })
    console.log(`User:${req.userId} successfully got bill with ID:${req.params.id}`)
  } catch (error) {
    console.log(`User:${req.userId} failed to get bill with ID:${req.params.id} with error:${error}`)
  }
}


// Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.id)
    console.log(`User:${req.userId} is trying to delete bill with ID:${req.params.id}`)
    if (!bill) {
      throw new ApiError(404, "Bill not found")
    }

    // Check if user is creator or admin
    if (bill.createdBy.toString() !== req.userId && req.user?.role !== "admin") {
      throw new ApiError(403, "Not authorized to delete this bill")
    }

    await bill.deleteOne()
    console.log(`User:${req.userId} successfully deleted bill with ID:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to delete bill with ID:${req.params.id} with error:${error}`)
  }
}

export const addBillPayement = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body
    const user = req.user
    console.log(`User:${req.userId} is trying to add payment to bill with ID:${req.params.id} with amount:${amount}`)
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

    bill.currentPayment = bill.payments.reduce((acc, item) => acc + item.amount, 0)
    if (bill.currentPayment > bill.totalAmount) {
      throw new ApiError(400, "Payment amount exceeds total amount")
    }else if (bill.totalAmount === bill.currentPayment) {
      bill.status = "Paid"
    }else{
      bill.currentPayment = bill.totalAmount - bill.currentPayment
    }

    await bill.save()
    console.log(`User:${req.userId} successfully added payment to bill with ID:${req.params.id} with amount:${amount}`)
    res.status(200).json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to add payment to bill with ID:${req.params.id} with amount:${req.body.amount} with error:${error}`)
  }
}
