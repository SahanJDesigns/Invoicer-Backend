import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User"
import Shop from "./models/Shop"
import Product from "./models/Product"
import Bill from "./models/Bill"

dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vetgrow")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Shop.deleteMany({})
    await Product.deleteMany({})
    await Bill.deleteMany({})

    console.log("Database cleared")

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      phone: "+1 (555) 123-4567",
      role: "admin",
    })

    // Create employee user
    const employee = await User.create({
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      phone: "+1 (555) 987-6543",
      role: "employee",
    })

    console.log("Users created")

    // Create shops
    const shop1 = await Shop.create({
      shopName: "PetCare Clinic",
      doctorName: "Dr. Smith",
      location: "123 Main St, New York, NY",
      contactNumber: "+1 (555) 123-4567",
      createdBy: admin._id,
    })

    const shop2 = await Shop.create({
      shopName: "Animal Hospital",
      doctorName: "Dr. Johnson",
      location: "456 Park Ave, Boston, MA",
      contactNumber: "+1 (555) 987-6543",
      createdBy: employee._id,
    })

    console.log("Shops created")

    // Create products
    const product1 = await Product.create({
      name: "Vaccination",
      price: 120.0,
      description: "Standard vaccination package",
      createdBy: admin._id,
    })

    const product2 = await Product.create({
      name: "Consultation",
      price: 80.0,
      description: "General health consultation",
      createdBy: admin._id,
    })

    const product3 = await Product.create({
      name: "Medicine",
      price: 50.0,
      description: "General medication",
      createdBy: admin._id,
    })

    console.log("Products created")

    // Create bills
    await Bill.create({
      invoiceNumber: "INV-001",
      shop: shop1._id,
      shopName: shop1.shopName,
      doctorName: shop1.doctorName,
      products: [
        {
          product: product1._id,
          name: product1.name,
          price: product1.price,
          quantity: 1,
        },
        {
          product: product2._id,
          name: product2.name,
          price: product2.price,
          quantity: 1,
        },
      ],
      totalAmount: product1.price + product2.price,
      status: "Unpaid",
      createdBy: admin._id,
      date: new Date("2023-05-15"),
    })

    await Bill.create({
      invoiceNumber: "INV-002",
      shop: shop2._id,
      shopName: shop2.shopName,
      doctorName: shop2.doctorName,
      products: [
        {
          product: product2._id,
          name: product2.name,
          price: product2.price,
          quantity: 1,
        },
        {
          product: product3._id,
          name: product3.name,
          price: product3.price,
          quantity: 2,
        },
      ],
      totalAmount: product2.price + product3.price * 2,
      status: "Paid",
      createdBy: employee._id,
      date: new Date("2023-05-14"),
    })

    console.log("Bills created")
    console.log("Database seeded successfully")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()

