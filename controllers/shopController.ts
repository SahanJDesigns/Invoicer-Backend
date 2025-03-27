import type { Request, Response, NextFunction } from "express"
import Shop from "../models/Shop"
import { ApiError } from "../utils/ApiError"

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName, doctorName, location, contactNumber} = req.body
    console.log(`User:${req.userId} is trying to Create a Shop with shopName:${shopName} and doctorName:${doctorName}`)
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
    
    console.log(`Shop successfully created with shopName:${shopName} and doctorName:${doctorName}`)
    
    res.status(201).json({
      success: true,
      data: shop,
    })

  } catch (error) {
    console.log(`User:${req.userId} failed to Create a Shop with shopName:${req.body.shopName} and doctorName:${req.body.doctorName} with error:${error}`)
    next(error)
  }
}

// Get a single shop
export const getShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await Shop.findById(req.params.id)
    console.log(`User:${req.userId} is trying to get a shop with id:${req.params.id}`)
    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }
    console.log(`User:${req.userId} successfully got a shop with id:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to get a shop with id:${req.params.id} with error:${error}`)
    next(error)
  }
}

// Update a shop
export const updateShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName, doctorName, location, contactNumber } = req.body
    console.log(`User:${req.userId} is trying to update a shop with id:${req.params.id}`)
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { shopName, doctorName, location, contactNumber },
      { new: true, runValidators: true },
    )

    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }
    console.log(`User:${req.userId} successfully updated a shop with id:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to update a shop with id:${req.params.id} with error:${error}`)
    next(error)
  }
}

// Delete a shop
export const deleteShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id)
    console.log(`User:${req.userId} is trying to delete a shop with id:${req.params.id}`)
    if (!shop) {
      throw new ApiError(404, "Shop not found")
    }

    console.log(`User:${req.userId} successfully deleted a shop with id:${req.params.id}`)

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to delete a shop with id:${req.params.id} with error:${error}`)
    next(error)
  }
}

// Search shops
export const searchShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query
    console.log(`User:${req.userId} is trying to search shops with query:${query}`)
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
    console.log(`User:${req.userId} successfully searched shops with query:${query}`)
    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to search shops with query:${req.query.query} with error:${error}`)
    next(error)
  }
}

