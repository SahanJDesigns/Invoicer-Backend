import type { Request, Response, NextFunction } from "express"
import User from "../models/User"
import { ApiError } from "../utils/ApiError"

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(400, "Email already in use")
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "employee",
    })

    // Generate token
    const token = user.generateAuthToken()

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, "Please provide email and password")
    }

    // Find user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      throw new ApiError(401, "Invalid credentials")
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials")
    }

    // Generate token
    const token = user.generateAuthToken()

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user

    res.status(200).json({
      success: true,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

