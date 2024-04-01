const express = require("express");
const router = express.Router();

// Autherization
const {protectRoute, adminProtectRoute} = require("../middlewares/authentication.js");


// Controllers
const {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders
} = require("../controllers/orderControllers.js");


router.post("/create", adminProtectRoute, createOrder);
router.get("/all-orders", adminProtectRoute, getAllOrders)
router.get("/:orderId", protectRoute, getOrderById);
router.patch("/:orderId", adminProtectRoute, updateOrder);
router.patch("/delete/:orderId", adminProtectRoute, deleteOrder);

module.exports = router;