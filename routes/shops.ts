import express from "express"
import { createShop, getAllShops, getShop, updateShop, deleteShop, searchShops } from "../controllers/shopController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.route("/").post(createShop).get(getAllShops)

router.get("/search", searchShops)

router.route("/:id").get(getShop).put(updateShop).delete(deleteShop)

export default router

