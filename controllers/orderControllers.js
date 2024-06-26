const asyncHandler = require("express-async-handler");
const { ObjectId } = require('mongodb');

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

  const { orderType } = req.query;
  let matchCondition = { isDeleted: false };

  // Dynamically set the match condition based on the orderType query parameter
  switch (orderType) {
    case 'unassign':
      matchCondition.status = 'unassign';
      break;
    case 'assign':
      matchCondition.status = 'assign';
      break;
    case 'in-progress':
      matchCondition.deliveryStatus = 'in-progress';
      break;
    case 'delivered':
      matchCondition.deliveryStatus = 'delivered';
      break;
    // No default case to allow fetching all non-deleted orders if no orderType is specified
  }


  try {
    const orders = await OrderModel.aggregate([
      { $match: matchCondition },
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
              { $arrayElemAt: ["$doc.partner_info.fullName", 0] }
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
          "status": "$doc.status",
          "deliveryStatus": "$doc.deliveryStatus",
          "orderNo": "$doc.products.orderNo",
          "deliverConfirmDoc": "$doc.deliverConfirmDoc",
          "reciverName": "$doc.reciverName",
          "deliveredDate": "$doc.deliveredDate",
          "address": "$doc.address",
          "orderNo": "$doc.orderNo"
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


// Request: GET
// Route: GET /api/orders/all-orders
// Access: PARTNER
const getMyOrders = asyncHandler(async (req, res) => {

  let matchCondition = { isDeleted: false, deliveryStatus: { $nin: ["rejected", "delivered"] } , partner: ObjectId(req.user.id) };


  try {
    const orders = await OrderModel.aggregate([
      { $match: matchCondition },
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
          totalQuantity: { $sum: "$products.quantity" },
          products: { $push: "$products" } 
        }
      },
      {
        $addFields: {
          
          "createdByName": {
            $concat: [
              { $arrayElemAt: ["$doc.createdBy_info.firstName", 0] },
              " ",
              { $arrayElemAt: ["$doc.createdBy_info.lastName", 0] }
            ]
          },
          "customerName": "$doc.customer.name",
          "customerEmail": "$doc.customer.email",
          "customerPhone": "$doc.customer.phone",
          "customerAddress": "$doc.customer.address.completeAddress",
          "status": "$doc.status",
          "deliveryStatus": "$doc.deliveryStatus",
          "orderNo": "$doc.orderNo",
          "products": "$products"
        }
      },
      {
        $project: {
          "doc": 0,
          "partner_info": 0,
          "createdBy_info": 0,
        }
      }
    ]);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: POST
// Route: POST /api/orders/reject/:orderId
// Access: PARTNER
const rejectOrder = asyncHandler(async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, { deliveryStatus: 'rejected' }, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: POST
// Route: POST /api/orders/accept/:orderId
// Access: PARTNER
const acceptOrder = asyncHandler(async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, { deliveryStatus: 'accepted' }, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Request: POST
// Route: POST /api/orders/run/:orderId
// Access: PARTNER
const addRemoveRunOrder = asyncHandler(async (req, res) => {
  try {
    
    const orderData = await OrderModel.findById(req.params.orderId);

    const updateBody = {}

    if (!orderData) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if(orderData.deliveryStatus === 'accepted'){
      updateBody.deliveryStatus = "picking"
    }else{
      updateBody.deliveryStatus = "accepted"
    }

    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, updateBody, {
      new: true,
    });


    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



// Request: GET
// Route: GET /api/orders/picking/all
// Access: PARTNER
const getMyPickingOrders = asyncHandler(async (req, res) => {

  let matchCondition = { isDeleted: false, deliveryStatus: { $eq: "picking" }  , partner: ObjectId(req.user.id) };


  try {
    const orders = await OrderModel.aggregate([
      { $match: matchCondition },
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
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          totalProducts: { $sum: 1 },
          totalWeight: { $sum: "$products.weight" },
          totalQuantity: { $sum: "$products.quantity" },
        }
      },
      {
        $addFields: {
          
          "customerName": "$doc.customer.name",
          "customerEmail": "$doc.customer.email",
          "customerPhone": "$doc.customer.phone",
          "customerAddress": "$doc.customer.address.completeAddress",
          "status": "$doc.status",
          "deliveryStatus": "$doc.deliveryStatus",
          "orderNo": "$doc.orderNo",
          "estimatedTime": "10m"
        }
      },
      {
        $project: {
          "doc": 0,
          "partner_info": 0,
          "createdBy_info": 0,
        }
      }
    ]);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: GET
// Route: GET /api/orders/progress/all
// Access: PARTNER
const getMyProgressOrders = asyncHandler(async (req, res) => {

  let matchCondition = { isDeleted: false, deliveryStatus: { $eq: "in-progress" }  , partner: ObjectId(req.user.id) };


  try {
    const orders = await OrderModel.aggregate([
      { $match: matchCondition },
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
          totalQuantity: { $sum: "$products.quantity" },
          products: { $push: "$products" } 
        }
      },
      {
        $addFields: {
          
          "customerName": "$doc.customer.name",
          "customerEmail": "$doc.customer.email",
          "customerPhone": "$doc.customer.phone",
          "customerAddress": "$doc.customer.address",
          "status": "$doc.status",
          "deliveryStatus": "$doc.deliveryStatus",
          "orderNo": "$doc.orderNo",
          "estimatedTime": "10m",
           "products": "$products"
        }
      },
      {
        $project: {
          "doc": 0,
          "partner_info": 0,
          "createdBy_info": 0,
        }
      }
    ]);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Request: PATCH
// Route: PATCH /api/orders/add-to-progress/:orderId
// Access: PARTNER
const addToProgressOrder = asyncHandler(async (req, res) => {
  try {
    const updateResult = await OrderModel.updateMany(
      { deliveryStatus: 'picking', partner: ObjectId(req.user.id) },
      { $set: { deliveryStatus: 'in-progress' } }
  );


  if (updateResult. nModified === 0) {
      return res.status(404).json({ success: false, message: "No orders found with status 'picking'" });
  }

    res.status(200).json({ success: true, message: `orders updated` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



// Request: POST
// Route: POST /api/orders/delivered/:orderId
// Access: PARTNER
const deliveredOrder = asyncHandler(async (req, res) => {
  try {

    if(!req.body.images){
      return res.status(404).json({ success: false, message: "Delivery Images Must be added" });
    }
    const order = await OrderModel.findByIdAndUpdate(req.params.orderId, {
      status: "delivered",
      deliveryStatus: "delivered",
      deliverConfirmDoc: req.body.images
    },{
      new: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: "Order Delivered Success" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});







module.exports = {
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
}







