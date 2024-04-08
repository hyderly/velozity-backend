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
    completeAddress: { type: String},
    lat: { type: Number},
    lng: { type: Number}
  },

  totalJobs: {
    type: Number,
    default: 0
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
    // required: [true, "User type is required"], // Need to uncomment this
    enum: ['super-admin', 'admin', 'partner']
  },

  status: {
    type: String,
    enum: ['available', 'not-available']
  },

  userVerifed:{
    type: Boolean,
    default: false,
  },

  userVerifedOTP:{
    type: String,
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

  license : {
    type: String,
    required: false,
    default: null
  },

  isTermsAccepted: {
    type: Boolean,
    default: false
  },


  insuranceDoc : {
    type: String,
    required: false,
  },
  registeredCertificateDoc: {
    type: String,
    required: false,
  },

  earning: {
    earingThisWeek: { type: String, required: false },
    earningThisMonth: { type: String, required: false },
    avgDeliveryTime: { type: String, required: false },
    distanceTraveled: { type: String, required: false },
  },

  emailVerifyToken: String,
  emailVerifyExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

}, { timestamps: true });




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
  // Generating a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Hashing the OTP
  const hashedOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Saving the hashed OTP and its expiry (valid for 5 minutes)
  this.emailVerifyToken = hashedOtp;
  this.emailVerifyExpiry = Date.now() + 5 * 60 * 1000;

  // The plain OTP is returned so it can be sent to the user, but not saved in plain text
  return otp;
};

userSchema.methods.verifyEmailOtp = function (submittedOtp) {
  const hashedSubmittedOtp = crypto
    .createHash('sha256')
    .update(submittedOtp)
    .digest('hex');

  // Check if the hashed OTP matches and is not expired
  const isOtpValid = hashedSubmittedOtp === this.emailVerifyToken && Date.now() < this.emailVerifyExpiry;
  console.log("isOtpValid", isOtpValid)
  if (isOtpValid) {
    // Clear the OTP fields once verified to prevent reuse
    this.emailVerifyToken = undefined;
    this.emailVerifyExpiry = undefined;
    this.userVerifed = true;
    return true;
  } else {
    return false;
  }
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
