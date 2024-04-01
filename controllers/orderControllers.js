const asyncHandler = require("express-async-handler");

// Import model
const OrderModel = require("../models/OrderModel");


// Request: POST
// Route: POST /api/orders/create
// Access: Admin
const createOrder = asyncHandler(async (req, res) => {
  try {
    const order = new OrderModel({
      createdBy: req.user._id, // Assuming the ID of the user creating the order is in req.user._id
      ...req.body // This includes partner, customer, products, and deliverConfirmDoc
    });
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: GET
// Route: GET /api/orders/:orderId
// Access: Admin, Partner
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.orderId).populate('createdBy partner');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: PATCH
// Route: PATCH /api/orders/:orderId
// Access: Admin
const updateOrder = asyncHandler(async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy partner');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: PATCH
// Route: PATCH /api/orders/delete/:orderId
// Access: Admin
const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, { isDeleted: true }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: GET
// Route: GET /api/orders/all-orders
// Access: Admin
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await OrderModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: "users", // Assuming 'users' is the collection name
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy_info"
        }
      },
      {
        $lookup: {
          from: "users", // Assuming 'users' is the collection name
          localField: "partner",
          foreignField: "_id",
          as: "partner_info"
        }
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          totalProducts: { $sum: 1 },
          totalWeight: { $sum: "$products.weight" },
          totalQuantity: { $sum: "$products.quantity" }
        }
      },
      {
        $addFields: {
          "partnerName": {
            $concat: [
              { $arrayElemAt: ["$doc.partner_info.firstName", 0] },
              " ",
              { $arrayElemAt: ["$doc.partner_info.lastName", 0] }
            ]
          },
          "createdByName": {
            $concat: [
              { $arrayElemAt: ["$doc.createdBy_info.firstName", 0] },
              " ",
              { $arrayElemAt: ["$doc.createdBy_info.lastName", 0] }
            ]
          },
          "customerName": "$doc.customer.name",
          "status": "$doc.products.status",
          "deliveryStatus": "$doc.products.deliveryStatus",
          "orderNo": "$doc.products.orderNo"
        }
      },
      {
        $project: {
          "doc": 0,
          "partner_info": 0,
          "createdBy_info": 0
        }
      }
    ]);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});




module.exports = {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders
}







