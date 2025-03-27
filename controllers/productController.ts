import type { Request, Response, NextFunction } from "express"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"

// Get all products
export const searchProduct = async (req: Request, res: Response) => {
  try {
    const { search } = req.query
    console.log(`User:${req.userId} is trying to get all products with search:${search}`)
    let query = {}

    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      }
    }

    const products = await Product.find(query).sort({ name: 1 })
    console.log(`User:${req.userId} successfully got all products with search:${search}`)
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to get all products on search:${req.query.search} with error:${error}`)
  }
}

// Get a single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    console.log(`User:${req.userId} is trying to get a product with id:${req.params.id}`)
    if (!product) {
      throw new ApiError(404, "Product not found")
    }
    console.log(`User:${req.userId} successfully got a product with id:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to get a product with id:${req.params.id} with error:${error}`)
  }
}
