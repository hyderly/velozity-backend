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
  getAllOrders,
  getMyOrders,
  rejectOrder,
  acceptOrder,
  addRemoveRunOrder,
  getMyPickingOrders,
  getMyProgressOrders,
  addToProgressOrder,
  deliveredOrder
} = require("../controllers/orderControllers.js");


router.post("/create", adminProtectRoute, createOrder);
router.get("/all-orders", adminProtectRoute, getAllOrders)
router.get("/all", protectRoute, getMyOrders)
router.get("/:orderId", protectRoute, getOrderById);
router.patch("/:orderId", adminProtectRoute, updateOrder);
router.patch("/delete/:orderId", adminProtectRoute, deleteOrder);

router.post("/reject/:orderId", protectRoute, rejectOrder)
router.post("/accept/:orderId", protectRoute, acceptOrder)
router.post("/run/:orderId", protectRoute, addRemoveRunOrder)
router.get("/picking/all", protectRoute, getMyPickingOrders)
router.get("/progress/all", protectRoute, getMyProgressOrders)
router.post("/add-to-progress", protectRoute, addToProgressOrder);
router.post("/delivered/:orderId", protectRoute, deliveredOrder)

module.exports = router;