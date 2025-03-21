import type { Request, Response, NextFunction } from "express"
import Shop from "../models/Shop"
import { ApiError } from "../utils/ApiError"

// Create a new shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName, doctorName, location, contactNumber} = req.body
    const temp = {
      shopName,
      doctorName,
      location,
      contactNumber,
      createdBy: req.userId,
    }
  
    const shop = await Shop.create({
      shopName,
      doctorName,
      location,
      contactNumber,
      createdBy: req.userId,
    })
    

    res.status(201).json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get all shops
export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get a single shop
export const getShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await Shop.findById(req.params.id)

    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }

    res.status(200).json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Update a shop
export const updateShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName, doctorName, location, contactNumber } = req.body

    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { shopName, doctorName, location, contactNumber },
      { new: true, runValidators: true },
    )

    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }

    res.status(200).json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Delete a shop
export const deleteShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id)

    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Search shops
export const searchShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query

    if (!query) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      })
      return
    }

    const shops = await Shop.find({
      $or: [
        { shopName: { $regex: query, $options: "i" } },
        { doctorName: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

