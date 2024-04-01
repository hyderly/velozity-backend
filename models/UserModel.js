const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
  },

  firstName: {
    type: String,
  },

  lastName: {
    type: String,
  },

  email: {
    type: String,

    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },

  mobileNumber: {
    type: String,
    // match: [/^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/, "Please fill a valid number"]
  },


  // For Operational
  firstNameOperation: {
    type: String,
  },

  lastNameOperation: {
    type: String,
  },

  emailOperation: {
    type: String,

    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },

  mobileNumberOperation: {
    type: String,
    // match: [/^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/, "Please fill a valid number"]
  },
  
  jobTitleOperation: {
    type: String,
    required: false,
  },

  // For Finance
  firstNameFinance: {
    type: String,
  },

  lastNameFinance: {
    type: String,
  },

  emailFinance: {
    type: String,

    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },

  mobileNumberFinance: {
    type: String,
    // match: [/^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/, "Please fill a valid number"]
  },

  jobTitleFinance: {
    type: String,
    required: false,
  },

  gender: {
    type: String,
    required: false,
    enum: ['male', 'female']
  },

  vat: {
    type: String,
  },

  company: {
    type: String,
  },

  jobTitle: {
    type: String,
    required: false,
  },

  profilePhoto: {
    type: String,
    require: false

  },
  
  password: {
    type: String,
    required: true,
    match: [
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/,
      'Password must be at least 8 characters long, include at least one uppercase letter, one number, and one symbol.'
    ]
  },

  address: {
    type: String,
    required: false,
  },

  invoiceAddress : {
    type: String,
    required: false,
  },

  country: {
    type: String,
    required: false,
  },

  city: {
    type: String,
    required: false,
  },

  state: {
    type: String,
    required: false,
  },

  postalCode: {
    type: String,
    required: false,
  },

  userType: {
    type: String,
    required: [true, "User type is required"],
    enum: ['super-admin', 'admin', 'partner']
  },

  userVerifed:{
    type: Boolean,
    default: true,
  },

  userVerifedOTP:{
    type: String,
    default: '1234',
  },

  emailVerifed: {
    type: Boolean,
    default: true,
  },

  isUserSuspensed: {
    type: Boolean,
    default: false,
  },
  isUserRejected: {
    type: Boolean,
    default: false,
  },

  vehichleType: {
    type: String,
    required: false,
    enum: ['truck', 'van']
  },

  FCMToken: {
    type: String,
    required: false
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false
  },

  totalJobs: {
    type: Number,
    required: false,
    default: 0
  },

  nationalid : {
    type: String,
    required: false,
  },
  passportNo: {
    type: String,
    required: false,
  },

  insuranceStartDate: {
    type: Date,
    required: false
  },
  insuranceEndDate: {
    type: Date,
    required: false
  },

  insuranceDoc : {
    type: String,
    required: false,
  },
  registeredCertificateDoc: {
    type: String,
    required: false,
  },

  plan: {
    id: String,
    name: String,
    duration: {
      type: String,
      enum: ["monthly", "yearly"]
    },
    startDate: {
      type: Date,
    },
    expireDate: {
      type: Date,
    },
    amountPaid:{
      type: String
    },
    amountCurrency: {
      type: String
    },
    paymentMethod: {
      type: String
    },
    paymentSuccess: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean
    }
  },

  emailVerifyToken: String,
  emailVerifyExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

}, { timestamps: true });


// userSchema.pre("save", function(next){
//   this.profilePhoto = `https://avatars.dicebear.com/api/identicon/${this.name.split(" ")[0]+this.email}.png`
//   next();
// })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getVerifyToken = async function () {
  const verifyToken = crypto.randomBytes(20).toString("hex");

  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  this.emailVerifyExpiry = Date.now() + 10 * 60 * 1000;

  return verifyToken;
};

userSchema.methods.getResetPasswordToken = async function () {
  // const resetToken = crypto.randomBytes(4).toString("hex");

  const resetToken = Math.floor(1000 + Math.random() * 9000).toString();

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserModel = mongoose.model("user", userSchema);


module.exports = UserModel;
