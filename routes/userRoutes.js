const express = require("express");
const router = express.Router();

// Autherization
const {protectRoute, adminProtectRoute, superAdminProtectRoute} = require("../middlewares/authentication.js");

// Controllers
const {
  adminRegister,
  customerRegister,
  getCustomers,
  DeleteUser,
  DeleteMultipleUsers,
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

  authUser,
  authRiderUser,
  verifyUser,
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
  DeleteOwnAccount,
  getAdmins,
  getRecentCustomers,
  getPlansCount
} = require("../controllers/userControllers.js");




router.post("/admin-register", adminRegister);
router.post("/customer-register", protectRoute, customerRegister);
router.post("/contractor-register", protectRoute, contractorRegister);
router.post("/rider-register", protectRoute, riderRegister);
router.get("/customers", protectRoute, getCustomers);
router.get("/contractors", protectRoute, getContractors);
router.get("/admins", superAdminProtectRoute, getAdmins);
router.get("/recent-customers", superAdminProtectRoute, getRecentCustomers);
router.get("/plan-counts", superAdminProtectRoute, getPlansCount);
router.get("/riders", protectRoute, getRiders);
router.delete("/:userID", protectRoute, DeleteUser);       
router.post("/delete-account", protectRoute, DeleteOwnAccount);       
router.post("/detele-users", protectRoute, DeleteMultipleUsers);       
router.patch("/profile/:id", protectRoute, updateProfile); 
router.patch("/changePassword", protectRoute, updatePassword); 
router.get("/customer/:vat", protectRoute, getCustomer); 
router.get("/single-customer/:name", protectRoute, getCustomerByName); 
router.get("/contractor/:vat", protectRoute, getContractor); 

// Open Requests
router.post("/customer-register-user",  customerRegister);
router.post("/contractor-register-user",  contractorRegister);
router.post("/rider-register-user",  riderRegister);


// Send Invitation
router.post("/invitation", protectRoute,  sendUserInvitation);






router.get("/", protectRoute, getAllUsers);
router.get("/riders", protectRoute, getAllRiders);
router.put("/emailverify/:verifytoken", verifyUser);
router.post("/login", authUser);
router.post("/login-rider", authRiderUser);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword", resetpassword);
router.get("/profile", protectRoute, getPorfile);
router.patch("/myProfile", protectRoute, updateOwnProfile);
router.patch("/registerFCMToken", protectRoute, registerFCMToken);    
router.patch("/updateRiderStatus/:userId", protectRoute, updateRiderStatus);
router.patch("/RejectRider/:userId", protectRoute, RejectRider);
router.patch("/otpVerify", protectRoute, verifyUserOTP);




module.exports = router;
