import type { Request, Response, NextFunction } from "express"
import User from "../models/User"
import { ApiError } from "../utils/ApiError"

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    console.log(`User tried to login with ${email} and ${password}`);
    // Validate input
    if (!email || !password) {
      console.log("User blocked because of missing email or password");
      throw new ApiError(400, "Please provide email and password")
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      console.log("User blocked because of invalid email");
      throw new ApiError(401, "Invalid Email or Password")
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      console.log("User blocked because of invalid Password"); 
      throw new ApiError(401, "Invalid Email or Password")
    }

    // Generate token
    const token = user.generateAuthToken()
    console.log(`User with UID: ${user._id} successfully logged in`);
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
  } catch (error:any) {
    console.log(error)
    res.status(401).json({
      success: false,
      message: error.message,
    }) 
  }
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user
    console.log(`User with UID: ${user?.id} is trying to get current user`);
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
    console.log(error)

  }
}

