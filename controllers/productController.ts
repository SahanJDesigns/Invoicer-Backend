import type { Request, Response, NextFunction } from "express"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"

// Create a new product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, description } = req.body

    const product = await Product.create({
      name,
      price,
      description,
      createdBy: req.userId,
    })

    res.status(201).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query

    let query = {}

    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      }
    }

    const products = await Product.find(query).sort({ name: 1 })

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Get a single product
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Update a product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, description } = req.body

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true, runValidators: true },
    )

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Delete a product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      throw new ApiError(404, "Product not found")
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

