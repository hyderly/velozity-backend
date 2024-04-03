const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    brandName: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    size: { type: String },
    color: { type: String },
    dimension: { type: String },
    weight: { type: Number },
    images: [{ type: String }], 
    qrCode: { type: String },
});

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
        completeAddress: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }
});

const OrderSchema = new mongoose.Schema({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'user id must be added']
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    customer: { 
        type: CustomerSchema, 
        required: true 
    },
    products: [ProductSchema], 
    deliverConfirmDoc: [{ type: String }], 
    isDeleted: {
      type: Boolean,
      default: false
    },
    orderNo: {
      type: String,
      required: true
    },
    status: { 
      type: String,
      enum: ['unassign', 'assign'],
      default: 'unassign'
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in-progress', 'delivered'],
      default: 'pending'
    }
}, { timestamps: true });

const OrderModel = mongoose.model("Order", OrderSchema);

module.exports = OrderModel;
