import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/ApiError"
import mongoose from "mongoose"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction):void => {
  console.error("Error:", err)

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((error) => error.message)
    res.status(400).json({
      success: false,
      error: "Validation Error",
      message: messages.join(", "),
    })
  }

  // Handle Mongoose duplicate key errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0]
    res.status(400).json({
      success: false,
      error: "Duplicate Field",
      message: `${field} already exists`,
    })
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
    })
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid Token",
      message: "Authentication invalid",
    })
  }

  // Handle JWT expiration
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Token Expired",
      message: "Authentication expired",
    })
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Server Error",
    message: "Something went wrong",
  })
}

