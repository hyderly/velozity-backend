const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const orderSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user id must be added']
    },
    orderId: {
        type: String,
        required: [true, 'Order Id is required'],
        unique: true,
        trim: true
    },
    contactName: {
        type: String,
        required: [true, 'Contact Name is required']
    },
    contactEmail: {
        type: String,
        required: [true, 'Email is required']
    },
    contactPhoneNumber: {
        type: String,
        required: [true, 'Phone Number is required']
    },
    description: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    internalReferenceNumber:{
        type: String,
        // required: [true, 'Internal reference number is required']
        required: false
    },
    itemType: {
        type: String,
        // required: [true, 'Item type is required']
        required: false
    },
    itemCount: {
        type: Number,
        required: false,
        default: 1
    },
    deliveryTime: {
        type: Date,
        required: false,
    },
    pickedTime: {
        type: Date,
        required: false,
    },
    deliverConfirmDoc: {
        type: Array,
        required: false,
        default: []
    },
    address: {
        type: {
            type: String,
            enum: ["points"], // emun : only available values
        },
        coordinates: {
            type: [Number],
            index: "2dsphere",
        },
        street: {
            type: String,
            required: [true, 'Street is required']
        },
        suburb: {
            type: String,
            required: [true, 'Suburb is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        postalCode: {
            type: String,
            required: [true, 'Postal Code is required']
        }
    },
    officalNumber: {
        type: String,
        required: false
    },
    direction: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
        enum: ['assign', 'pending', 'delivered', 'start'],
        default: 'pending'
    },
    isAssigned: {
        type: Boolean,
        required: false,
        default: false,
    },
    isValidOrder: {
        type: Boolean,
        required: false,
        default: false,
    }
}, {timestamps: true});

// Create location using geocoder and mapquest
orderSchema.pre("save", async function (next) {
    const loc = await geocoder.geocode({
        address: `${this.address.street}, ${this.address.suburb}`,
        country: 'Australia',
        zipcode: this.address.postalCode
      });
    
    if((loc[0].latitude >= -90 & loc[0].latitude <= 90) && (loc[0].longitude >= -180 && loc[0].longitude <= 180)){
    this.isValidOrder = true
    }else{
    this.isValidOrder = false
    }

    this.address = {
      type: "points",
      coordinates: [loc[0].longitude, loc[0].latitude],
      street: this.address.street,
      suburb: this.address.suburb,
      state: this.address.state,
      postalCode: this.address.postalCode,
    };
    this.officalNumber = '02 9055 7795';
    this.direction = `http://www.google.com/maps/place/${loc[0].latitude},${loc[0].longitude}`
  
    next();
});

// Create location using geocoder and mapquest
orderSchema.pre("insertMany", async function (next, docs) {

    docs.map(async (item) => {
        const loc = await geocoder.geocode({
            address: `${item.address.street}, ${item.address.suburb}`,
            country: 'Australia',
            zipcode: item.address.postalCode
        });
        item.coordinates = [loc[0].longitude, loc[0].latitude],
        item.direction = `http://www.google.com/maps/place/${loc[0].latitude},${loc[0].longitude}`

    })
    
    next();
});


const OrderModel = mongoose.model("order", orderSchema);

module.exports = OrderModel;
