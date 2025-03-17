import express from "express"
import {
  createBill,
  getAllBills,
  getBill,
  updateBillStatus,
  deleteBill,
  getBillsByShop,
  getBillsByDoctor,
  getBillByInvoice,
  addBillPayement
} from "../controllers/billController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.route("/").post(createBill).get(getAllBills)

router.route("/:id").get(getBill).put(updateBillStatus).delete(deleteBill)

router.get("/byshop/:shopName", getBillsByShop)
router.get("/bydoctor/:doctor", getBillsByDoctor)
router.get("/byinvoice/:invoice", getBillByInvoice)
router.post("/addpayment/:id", addBillPayement)


export default router

