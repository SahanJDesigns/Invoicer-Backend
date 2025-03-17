import express from "express"
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.route("/").post(createProduct).get(getAllProducts)

router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct)

export default router

