const asyncHandler = require("express-async-handler");
const generateWebToken = require("../utils/generateToken.js");
const {sendInvitation, sendCreds, sendOTP} = require("../utils/sendMail.js");
const crypto = require("crypto");
const sanitize = require("mongo-sanitize");
var generator = require('generate-password');

const axios = require("axios");


// Import model
const UserModel = require("../models/UserModel.js");


const {notification, riderNotifications} = require("../utils/notifications.js");

// Request: POST
// Route: POST /api/users/admin-register
// Access: Public
// Admin Registeration

const adminRegister = asyncHandler(async (req, res) => {
  const {
    email,
    mobileNumber,
  } = req.body;

  var randomPassword = generator.generate({
    length: 10,
    numbers: true
  });




  // Check if user is exist
  const isExists = await UserModel.findOne({ email, userType: "admin" });
  const isExistsByPhone = await UserModel.findOne({ mobileNumber, userType: "admin" });


  const adminPassword = req.body.password ? req.body.password : randomPassword;



  if (isExists || isExistsByPhone) {
    throw new Error("Customer Already exist with this email address or phone number");
  }

  // Create new user
  const user = await UserModel.create({...req.body, password: adminPassword, userType: "admin"});

  user.save();

  if(user){

    return res
    .status(200)
    .json({ success: true, message: "Register Successfully", token: generateWebToken(user._id)});
  }else{
    res.status(400);
    throw new Error("Register Failed");
    
  }
});




// Request: POST
// Route: POST /api/users/customer-register
// Access: Public
// Customer Registeration

const customerRegister = asyncHandler(async (req, res) => {
  const {
    email,
    mobileNumber,
  } = req.body;


  var randomPassword = generator.generate({
    length: 10,
    numbers: true
  });


  // Check if user is exist
  const isExists = await UserModel.findOne({ email, userType: "customer" });
  const isExistsByPhone = await UserModel.findOne({ mobileNumber, userType: "customer" });



  if (isExists || isExistsByPhone) {
    throw new Error("Customer Already exist with this email address or phone number");
  }

  // Create new user
  const user = await UserModel.create({...req.body, password: randomPassword, userType: "customer", createdBy: req?.user?._id ? req.user._id : req.body.createdBy});

  user.save();

  if(user){

    sendCreds({
      email: req.body.email,
      name: req.body.firstName ? req.body.firstName : req.body.fullName,
      link: process.env.FRONTEND_URL,
      userEmail: req.body.email,
      userPassword: randomPassword,
      message: "Your Customer account has been created please check link to access the system",
      subject: `${req.body.firstName ? req.body.firstName : req.body.fullName} - Login Creds.`,
    });


    return res
    .status(200)
    .json({ success: true, message: "Customer Register Successfully", data: user });
  }else{
    res.status(400);
    throw new Error("Customer Register Failed");
    
  }
});


// Request: POST
// Route: POST /api/users/contractor-register
// Access: Public
// Contractor Registeration

const contractorRegister = asyncHandler(async (req, res) => {
  const {
    email,
    mobileNumber,
  } = req.body;

  var randomPassword = generator.generate({
    length: 10,
    numbers: true
  });


  // Check if user is exist
  const isExists = await UserModel.findOne({ email, userType: "contractor" });
  const isExistsByPhone = await UserModel.findOne({ mobileNumber, userType: "contractor" });



  if (isExists || isExistsByPhone) {
    throw new Error("Contractor Already exist with this email address or phone number");
  }

  // Create new user
  const user = await UserModel.create({...req.body, password: randomPassword, userType: "contractor", createdBy: req?.user?._id ? req.user._id : req.body.createdBy});

  user.save();

  if(user){

    sendCreds({
      email: req.body.email,
      name: req.body.firstName ? req.body.firstName : req.body.fullName,
      link: process.env.FRONTEND_URL,
      userEmail: req.body.email,
      userPassword: randomPassword,
      message: "Your Contracttor account has been created please check link to access the system",
      subject: `${req.body.firstName ? req.body.firstName : req.body.fullName} - Login Creds.`,
    });


    return res
    .status(200)
    .json({ success: true, message: "Contractor Register Successfully", data: user  });
  }else{
    res.status(400);
    throw new Error("Contractor Register Failed");
    
  }
});


// Request: POST
// Route: POST /api/users/rider-register
// Access: Public
// Rider Registeration

const riderRegister = asyncHandler(async (req, res) => {
  const {
    email,
    mobileNumber,
    fullName,
    gender
  } = req.body;

  var randomPassword = generator.generate({
    length: 10,
    numbers: true
  });


  // Check if user is exist
  const isExists = await UserModel.findOne({ email, userType: "rider" });
  const isExistsByPhone = await UserModel.findOne({ mobileNumber, userType: "rider" });



  if (isExists || isExistsByPhone) {
    throw new Error("Driver Already exist with this email address or phone number");
  }

  // Create new user
  const user = await UserModel.create({...req.body, password: req.body?.password ? req.body?.password : randomPassword, userType: "rider", createdBy: req?.user?._id ? req.user._id : req.body.createdBy});

  user.save();

  if(user){
    sendCreds({
      email: req.body.email,
      name: req.body.firstName ? req.body.firstName : req.body.fullName,
      link: "https://apps.apple.com/app/go-trucking/id6464393709",
      userEmail: req.body.email,
      userPassword: randomPassword,
      message: "Your Rider account has been created please check link to access the system",
      subject: `${req.body.firstName ? req.body.firstName : req.body.fullName} - Login Creds.`,
    });

    return res
    .status(200)
    .json({ success: true, message: "Rider Register Successfully", token: generateWebToken(user._id), data: user  });
  }else{
    res.status(400);
    throw new Error("Rider Register Failed");
    
  }
});


// Verify User OTP
// Request: PATCH
// Route: Patch /api/users/otpVerify
// Access: Private
const verifyUserOTP = asyncHandler(async (req, res) => {
  
  const user = await UserModel.findById(req.user.id)

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (user.userVerifed) {
    res.status(400);
    throw new Error("User Already Verify");
  }else{
    await UserModel.findByIdAndUpdate(req.user.id, {
      userVerifed: true
    });

    res.status(200).json({
      message: "User verified",
      token: generateWebToken(user._id),
    });
  }


  
});

// Request: PUT
// Route: PUT /api/users/emailverify/:verifytoken
// Access: Public
const verifyUser = asyncHandler(async (req, res) => {
  const VerifyTokens = sanitize(req.params.verifytoken);
  const emailVerifyToken = crypto
    .createHash("sha256")
    .update(VerifyTokens)
    .digest("hex");


  const user = await UserModel.findOne({
    emailVerifyToken,
    emailVerifyExpiry: { $gt: Date.now() },
  });
  
  if (!user) {
    res.status(500);
    throw new Error("Email Not Verify or already verified");
  }

  if (user.emailVerify) {
    res.status(400);
    throw new Error("User Already Verify");
  }


  user.emailVerify = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpiry = undefined;

  user.save();

  res.status(202).json({
    message: "User verified",
    token: generateWebToken(user._id),
  });
});

// Request: POST
// Route: POST /api/users/login
// Access: Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email, userType: { $ne: "rider" } });

  if (!user) {
    throw new Error("Wrong Email or Password");
  }

  if (user.userType === "rider") {
    throw new Error("You do not have access");
  }


  const isMatched = await user.matchPassword(password);

  if (!isMatched) {
    throw new Error("Wrong Email or Password");
  }

  if (!email || !password) {
    throw new Error("Please enter email and password");
  }

  if (user && isMatched) {
    // notification("User Logedin", `${email} user has been Login`, `${email}`, "users");

    res.status(200).json({
      id: user._id,
      email,
      name: user.firstName,
      userType: user.userType,
      token: generateWebToken(user._id),
    });
  }
});


// Request: POST
// Route: POST /api/users/rider-login
// Access: Public
const authRiderUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email, userType: "rider" });

  if (!user) {
    return res.status(400).json({
      message: "Wrong Email or Password"
    })
    // throw new Error("Wrong Email or Password");
  }

  if (user.userType !== "rider") {
    return res.status(400).json({
      message: "Wrong Email or Password"
    })
    // throw new Error("You do not have access");
  }

  if (user.userVerifed !== true) {
    throw new Error("Please Verify your account");
  }


  const isMatched = await user.matchPassword(password);

  if (!isMatched) {
    return res.status(400).json({
      message: "Wrong Email or Password"
    })
    // throw new Error("Wrong Email or Password");
  }

  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter email and password"
    })
    // throw new Error("Please enter email and password");
  }

  if (user && isMatched) {
    // notification("User Logedin", `${email} user has been Login`, `${email}`, "users");

    res.status(200).json({
      id: user._id,
      email,
      name: user.firstName,
      userType: user.userType,
      token: generateWebToken(user._id),
    });
  }
});


// Request: GET Admins
// Route: GET /api/users/admins
// Access: Private
const getAdmins = asyncHandler(async (req, res) => {

  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "admin" };
  } 

  const admins = await UserModel.find(query);

  if (!admins) {
    res
    .status(400)
    .json({success: false, message: "Admins Not found"})
  }else{

    res
    .status(200)
    .json({success: true, count: admins.length, admins: admins.reverse() })
  }

});


// Request: GET Customers
// Route: GET /api/users/customers
// Access: Private
const getCustomers = asyncHandler(async (req, res) => {

  
  let query = {};

  console.log("req.user.userType", req.user.userType)
  
  if (req.user.userType === "super-admin") {
    query = { userType: "customer" };
  } else {
    query = { userType: "customer", createdBy: req.user._id };
  }

  const customers = await UserModel.find(query);

  if (!customers) {
    res
    .status(200)
    .json({success: true, count: customers.length, customers: customers.reverse() })
  }else{

    res
    .status(200)
    .json({success: true, count: customers.length, customers: customers.reverse() })
  }

});


// Request: GET Contractor
// Route: GET /api/users/contractors
// Access: Private
const getContractors = asyncHandler(async (req, res) => {

  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "contractor" };
  } else {
    query = { userType: "contractor", createdBy: req.user._id };
  }
  
  const contractors = await UserModel.find(query);

  if (!contractors) {
    res
    .status(200)
    .json({success: true, count: contractors.length, contractors: contractors.reverse() })
  }else{

    res
    .status(200)
    .json({success: true, count: contractors.length, contractors: contractors.reverse() })
  }

});

// Request: GET Riders
// Route: GET /api/users/riders
// Access: Private
const getRiders = asyncHandler(async (req, res) => {

  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "rider" };
  } else {
    query = { userType: "rider", createdBy: req.user._id };
  }
  
  const riders = await UserModel.find(query);

  if (!riders) {
    res
    .status(200)
    .json({success: true, count: riders.length, riders: riders.reverse() })
  }else{

    res
    .status(200)
    .json({success: true, count: riders.length, riders: riders.reverse() })
  }

});


// Request: GET Customer by vat
// Route: GET /api/users/customer/:vat
// Access: Private
const getCustomer = asyncHandler(async (req, res) => {
  
  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "customer",  vat: { $regex: req.params.vat, $options: "i" } };
  } else {
    query = { userType: "customer", vat: { $regex: req.params.vat, $options: "i" }, createdBy: req.user._id };
  }

  const customer = await UserModel.findOne(query);
  

  console.log("customer", customer)

  if (!customer) {
    res
    .status(400)
    .json({success: false, message: "Customer Not found"})
  }else{

    res
    .status(200)
    .json({success: true, user: customer })
  }

});


// Request: GET Customer by name
// Route: GET /api/users/customer/:name
// Access: Private
const getCustomerByName = asyncHandler(async (req, res) => {

  let customerQuery = {
    userType: "customer"
  };
  
  if (req.user.userType === "super-admin") {
    if (req.params.name) {
      customerQuery.$or = [
        { fullName: { $regex: req.params.name, $options: "i" } },
        { firstName: { $regex: req.params.name, $options: "i" } },
        { lastName: { $regex: req.params.name, $options: "i" } },
        { company: { $regex: req.params.name, $options: "i" } }
      ];
    }
  } else {
    customerQuery.createdBy = req.user._id;
    if (req.params.name) {
      customerQuery.$and = [
        {
          $or: [
            { fullName: { $regex: req.params.name, $options: "i" } },
            { firstName: { $regex: req.params.name, $options: "i" } },
            { lastName: { $regex: req.params.name, $options: "i" } },
            { company: { $regex: req.params.name, $options: "i" } }
          ]
        }
      ];
    }
  }
  
  const customer = await UserModel.find(customerQuery);
   

  console.log("customer", customer)

  if (!customer) {
    res
    .status(400)
    .json({success: false, message: "Customer Not found"})
  }else{

    res
    .status(200)
    .json({success: true, user: customer })
  }

});


// Request: GET Contractor
// Route: GET /api/users/contractor/:vat
// Access: Private
const getContractor = asyncHandler(async (req, res) => {
  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "contractor",  vat: { $regex: req.params.vat, $options: "i" } };
  } else {
    query = { userType: "contractor", vat: { $regex: req.params.vat, $options: "i" }, createdBy: req.user._id };
  }

  const contractor = await UserModel.findOne(query);

  console.log("contractor", contractor)

  if (!contractor) {
    res
    .status(400)
    .json({success: false, message: "Contractor Not found"})
  }else{

    res
    .status(200)
    .json({success: true, user: contractor })
  }

});


// Request: POST
// Route: POST /api/users/forgotpassword
// Access: Public

const forgotPassword = asyncHandler(async (req, res) => {

  let user

  const userEmail = sanitize(req.body.email);
  const userPhone = sanitize(req.body.phone);


  if(req.body.email){
   user = await UserModel.findOne({ email: userEmail });

  }else if (req.body.phone){
    user = await UserModel.findOne({ mobileNumber: userPhone });
  }

  if (!user) {
    res.status(400);
    throw new Error("Cannot perform forget password for this user");
  }


  if (user) {
    const resetToken = await user.getResetPasswordToken();

    console.log("resetToken", resetToken);

    user.save({ validateBeforeSave: false });

    // const resetUrl = `${req.protocol}://localhost:3000/resetpassword/${resetToken}`;
    const message = `Your reset passoword token:  ${resetToken}`;

    try {
      sendOTP({
        email: user.email,
        name: user.firstName ? user.firstName : user.fullName,
        message: "Your OTP for reset your password",
        subject: `${user.firstName ? user.firstName : user.fullName} - Your One Time Password`,
        otp: resetToken
      });

      res.status(200).json({message: "Reset Password Email has been Sent"});
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;

      user.save({ validateBeforeSave: false });

      res.status(400).json({message: "Email could not sent"});
    }
  }
});

// Request: Update
// Route: PATCH /api/users/resetpassword/:resettoken
// Access: Public

const resetpassword = asyncHandler(async (req, res) => {
  const { otp, password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token Invalid or Expired");
  }


  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Password Must Matched");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  user.save();

  res.status(200).json({
    message: "Password Reset Successfully",
    token: generateWebToken(user._id),
  });
});

// Request: PUT
// Route: PUT /api/users/changePassword
// Access: Private
const updatePassword = asyncHandler(async (req, res) => {

  // Check Confirm Password Match
  if (!req.body.newPassword || !req.body.confirmPassword || !req.body.oldPassword) {
    res.status(400);
    throw new Error("New, Confirm And Old Password Must Be Provided");
  }

  // Check Confirm Password Match
  if (req.body.newPassword !== req.body.confirmPassword) {
    res.status(400);
    throw new Error("Password Must Matched");
  }

  const user = await UserModel.findById(req.user.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }


  // Check Old Password Match

  const isMatched = await user.matchPassword(req.body.oldPassword);

  if (!isMatched) {
    res.status(400);
    throw new Error("Old Password Not Matched");
  }


  user.password = req.body.newPassword


  user.save();

  // notification("User Updates", `${user.email} profile has been updated`, "", "users");


  res.status(200).json({success: true, message: 'User Password Successfully Updated', user: user});
});

// Request: GET
// Route: GET /api/users/profile
// Access: Private
const getPorfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (user) {
    res.status(200);
    res.json(user);
  }
});

// Request: PUT
// Route: PUT /api/users/myProfile
// Access: Private
const updateOwnProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id)

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  await UserModel.findByIdAndUpdate(req.user.id, req.body);


  const newUser = await UserModel.findById(req.user.id);

  // notification will be added later
  // notification("User Updates", `${user.email} profile has been updated`, "itself", "users");


  res.status(200).json({message: "User Updated Successfully", user: newUser});
});


// Request: GET
// Route: GET /api/users
// Access: Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find({});

  if (!users) {
    res.status(400);
    throw new Error("No User Found");
  }

  res
  .status(200)
  .json({success: true, count: users.length, users: users })
});


// Request: GET RIDERS
// Route: GET /api/riders
// Access: Private
const getAllRiders = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const suspened = req.query.suspened;
  const queryStatus = status === "approved" ? true : status === "unapproved" ? false : null;
  const body = {userType: 'rider'}
  if(queryStatus !== null){
    body.userVerifed = queryStatus
  }
  if(suspened !== 'undefined'){
    body.isUserSuspensed = suspened
  }else if(!suspened){
    body.isUserSuspensed = false
  }
  const riders = await UserModel.find(body);

  if (!riders) {
    res.status(400);
    throw new Error("No User Found");
  }

  res
  .status(200)
  .json({success: true, count: riders.length, riders: riders.reverse() })
});


// Request: Patch
// Route: Patch /api/users/profile
// Access: Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }


  const updateUser = await UserModel.findByIdAndUpdate(req.params.id, req.body);


  const newUser = await UserModel.findById(req.params.id);


  res.status(200).json({success: true, message: 'user successfully updated', user: newUser});
});


// Request: DELETE
// Route: DELETE /api/users/:userID
// Access: Private
const DeleteUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.userID).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }


  if(user.userType === "super-admin"){
    res.status(400);
    throw new Error("Admin Users cannot be deleted");
  }


  const deleteUser = await UserModel.findByIdAndRemove(req.params.userID);


  if (deleteUser) {
    res.status(200);
    res.status(200).json({success: true, message: 'Deleted Successfully'});
  }else{
    res.status(400);
    throw new Error("Deletion Failed");
  }
});


// Request: DELETE OWN Account
// Route: DELETE /api/users/delete
// Access: Private
const DeleteOwnAccount = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }


  if(user.userType === "super-admin"){
    res.status(400);
    throw new Error("Admin Users cannot be deleted");
  }


  const deleteUser = await UserModel.findByIdAndRemove(req.user.id);


  if (deleteUser) {
    res.status(200);
    res.status(200).json({success: true, message: 'Deleted Successfully'});
  }else{
    res.status(400);
    throw new Error("Deletion Failed");
  }
});


// Request: DELETE Multiple
// Route: POST /api/users/detele-users
// Access: Private
const DeleteMultipleUsers = asyncHandler(async (req, res) => {
  UserModel.deleteMany({ _id: { $in: req.body.ids } })
  .then((result) => {
    res.status(200);
    res.status(200).json({success: true, message: 'Deleted Successfully'});
  })
  .catch((error) => {
    console.error('Error deleting users:', error);
    res.status(400);
    throw new Error("Deletion Failed");
  });



});

// Register FCM Token
const registerFCMToken = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  user.FCMToken = req.body.fcmToken || user.FCMToken;

  user.save();

  res.status(200).json({message: "FCM Token Updated Successfully"});
});


// Update Rider Status 
const updateRiderStatus = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const status = req.body.status;
  const suspened = req.body.suspened;

  const body = {userVerifed: status};

  if(suspened !== null){
    body.isUserSuspensed = suspened;
  }

  const CheckUser = await UserModel.findById(userId);

  if (!CheckUser) {
    res.status(400);
    throw new Error("User not found");
  }
  
  const user = await UserModel.findByIdAndUpdate(userId, body, {new: true});

  if(suspened){
    notification("User Suspended", `Rider ${user.name} is suspended`, "", "Users");
    riderNotifications(user._id, "Suspended", `Your account has been suspended by admin`, "-")
    await axios.post(`${process.env.BASE_URL}/push-notifications`, {
      title: "Suspensed",
      body: `Your Account has been Suspensed`,
      tokens: [CheckUser.FCMToken]
    })
  }
  else if(status === true){
    notification("User Verified", `Rider ${user.name} is verified now`, "", "Users");
    riderNotifications(user._id, "Account Verified", `Your account has been verified`, "-")
    await axios.post(`${process.env.BASE_URL}/push-notifications`, {
      title: "Account Verified",
      body: `Your Account has been Verified`,
      tokens: [CheckUser.FCMToken]
    })
  }

  if (user) {
    res.status(200).json({success: true, message: 'User status successfully updated', user: user});
  }else{
    res.status(400);
    throw new Error("User status update failed");
  }
});


const RejectRider = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const user = await UserModel.findById(userId);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  
  const userRejected = await UserModel.findByIdAndUpdate(userId, {isUserRejected: true}, {new: true});


  if(userRejected){
    notification("User Rejected", `Rider ${user.name} Profile is Rejected`, "", "Users");
    riderNotifications(user._id, "Rejected", `Your account has been rejected by admin`, "-")
    if(user.FCMToken){

      await axios.post(`${process.env.BASE_URL}/push-notifications`, {
        title: "Rejected",
        body: `Your Account has been Rejected`,
        tokens: [user.FCMToken]
      })
    }

    res.status(200).json({success: true, message: 'User profile rejected successfully'});
  }else{
    res.status(400);
    throw new Error("User status update failed");
  }
});







// Request: POST
// Route: POST /api/users/invitation
// Access: Private
const sendUserInvitation = asyncHandler(async (req, res) => {


  try {

    if(req.body.type === "customer"){

      const message = "You have been invited to create a customer account with following link"
  
      sendInvitation({
        email: req.body.email,
        application: "Customer",
        name: req.body.name,
        link: process.env.FRONTEND_URL + 'create_customer' + '?' + "id=" + req.user._id,
        message,
        subject: `${req.body.name} - Your Customer Account Invitation`,
      });
    }else if(req.body.type === "driver"){
  
      const message = "You have been invited to create a driver account with following link"
  
      sendInvitation({
        email: req.body.email,
        application: "Driver",
        name: req.body.name,
        link: process.env.FRONTEND_URL + 'create_driver' + '?' + "id=" + req.user._id,
        message,
        subject: `${req.body.name} - Your Driver Account Invitation`,
      });
    }else if(req.body.type === "contractor"){
  
      const message = "You have been invited to create a contractor account with following link"
  
      sendInvitation({
        email: req.body.email,
        application: "Contracttor",
        name: req.body.name,
        link: process.env.FRONTEND_URL + 'create_contractor' + '?' + "id=" + req.user._id,
        message,
        subject: `${req.body.name} - Your Contractor Account Invitation`
      });
    }

    return res
    .status(200)
    .json({ success: true, message: "Invitation Sent Successfully" });
    
  } catch (error) {
    console.log("error sending email", error)
    res.status(400);
    throw new Error("shipment Register Failed");
  }
  

});


// Request: GET Recent Admins Customers
// Route: GET /api/users/recent-customers
// Access: Private
const getRecentCustomers = asyncHandler(async (req, res) => {

  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "admin" };
  } 

  const recentCustomers = await UserModel.find(query).sort({ createdAt: -1 }).limit(5);

  if (!recentCustomers) {
    res
    .status(400)
    .json({success: false, message: "Recent Customers Not found"})
  }else{

    res
    .status(200)
    .json({success: true, count: recentCustomers.length, customers: recentCustomers })
  }

});


// Request: GET Plan Counts
// Route: GET /api/users/plans Count
// Access: Private
const getPlansCount = asyncHandler(async (req, res) => {

  
  let query = {};
  
  if (req.user.userType === "super-admin") {
    query = { userType: "admin" };
  } 

  const customersPlans = await UserModel.find({
    userType: "admin",
    "plan.isActive": true
  });

  const allCustomers = await UserModel.find({
    userType: "admin"
  });

  const nonActiveCustomers = await UserModel.find({
    userType: "admin",
    "plan.isActive": false
  });

  const userData = [
    {
      name: "All Customers",
      value: allCustomers.length
    },
    {
      name: "Active Customers",
      value: customersPlans.length
    },
    {
      name: "Inactive Customers",
      value: nonActiveCustomers.length
    }
  ]


  const planCounts = {};
  const data = [];

customersPlans.forEach(customer => {
  const planName = customer.plan.name;

  if (!planCounts[planName]) {
    planCounts[planName] = 1;
  } else {
    planCounts[planName]++;
  }
});

for (const name in planCounts) {
  data.push({ name, value: planCounts[name] });
}

  console.log("planCounts", planCounts)

  if (!planCounts) {
    res
    .status(400)
    .json({success: false, message: "Unable to get plans counts"})
  }else{

    res
    .status(200)
    .json({success: true, plansCount: data, userCount: userData })
  }

});



module.exports = {
  adminRegister,
  customerRegister,
  getCustomers,
  DeleteUser,
  DeleteMultipleUsers,
  DeleteOwnAccount,
  contractorRegister,
  riderRegister,
  getContractors,
  getRiders,
  getCustomer,
  getContractor,
  sendUserInvitation,
  verifyUserOTP,
  getCustomerByName,
  updatePassword,


  verifyUser,
  authUser,
  authRiderUser,
  forgotPassword,
  resetpassword,
  getPorfile,
  updateOwnProfile,
  getAllUsers,
  updateProfile,
  getAllRiders,
  
  registerFCMToken,
  updateRiderStatus,
  RejectRider,
  getAdmins,
  getRecentCustomers,
  getPlansCount
}
