import express from "express"
import {
  searchProduct,
  getProduct,
} from "../controllers/productController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.route("/search").get(searchProduct)
router.route("/:id").get(getProduct)
export default router

