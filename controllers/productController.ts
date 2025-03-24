import type { Request, Response, NextFunction } from "express"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiError"

// Create a new product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, description } = req.body
    console.log(`User:${req.userId} is trying to Create a Product with name:${name} and price:${price}`)
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
    console.log(`Product successfully created with name:${name} and price:${price}`)
  } catch (error) {
    const { name, price } = req.body
    console.log(`User:${req.userId} failed to Create a Product on name:${name} and price:${price} with error:${error}`)
    next(error)
  }
}

// Get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error)
  }
}

// Get a single product
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error)
  }
}

// Update a product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, description } = req.body
    console.log(`User:${req.userId} is trying to update a product with id:${req.params.id}`)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true, runValidators: true },
    )

    if (!product) {
      throw new ApiError(404, "Product not found")
    }
    console.log(`User:${req.userId} successfully updated a product with id:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to update a product with id:${req.params.id} with error:${error}`)
    next(error)
  }
}

// Delete a product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    console.log(`User:${req.userId} is trying to delete a product with id:${req.params.id}`)
    if (!product) {
      throw new ApiError(404, "Product not found")
    }
    console.log(`User:${req.userId} successfully deleted a product with id:${req.params.id}`)
    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.log(`User:${req.userId} failed to delete a product with id:${req.params.id} with error:${error}`)
    next(error)
  }
}

