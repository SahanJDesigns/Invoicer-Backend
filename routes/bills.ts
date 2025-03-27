import express from "express"
import {
  createBill,
  searchBills,
  getBill,
  deleteBill,
  addBillPayement
} from "../controllers/billController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.route("/:id").get(getBill).delete(deleteBill)
router.get("/search", searchBills)
router.post("/addpayment/:id", addBillPayement)

export default router

