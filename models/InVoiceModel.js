const mongoose = require("mongoose");

const InVoiceSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user id must be added']
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    ledgerId: {
        type: String,
        required: [true, 'Ledger Id is required'],
        unique: true,
        trim: true
    },
    shiftId: {
        type: String,
        required: [true, 'Shift Id is required'],
    },

    paidTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user id must be added']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    ledegerType: {
        type: String,
        required: [true, 'Ledger Type is required'],
        enum: ['rider', 'admin']
    },
    status: {
        type: String,
        required: false,
        enum: ['paid', 'unpaid', 'cancelled'],
        default: 'unpaid'
    }
    
}, {timestamps: true});


const InVoiceModel = mongoose.model("invoice", InVoiceSchema);

module.exports = InVoiceModel;