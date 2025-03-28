import express from "express"
import {
  createBill,
  searchBills,
  getBill,
  deleteBill,
  addBillPayement,
  deletePayment
} from "../controllers/billController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)
router.post("/", createBill)
router.get("/search", searchBills)
router.route("/:billId").get(getBill).delete(deleteBill)
router.post("/addpayment/:billId", addBillPayement)
router.delete("deletepayment/:paymentId", deletePayment)

export default router

