import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User, { type IUser } from "../models/User"
import { ApiError } from "../utils/ApiError"

interface JwtPayload {
  id: string
  name: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      userId?: string
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication invalid")
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vetgrow-secret-key") as JwtPayload

    // Find user
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      throw new ApiError(401, "Authentication invalid")
    }

    // Attach user to request
    req.user = user
    req.userId = user?._id?.toString();

    next()
  } catch (error) {
    next(new ApiError(401, "Authentication invalid"))
  }
}

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    next(new ApiError(403, "Access denied. Admin role required"))
  }
}

