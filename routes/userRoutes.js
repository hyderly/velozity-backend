const express = require("express");
const router = express.Router();

// Autherization
const {protectRoute, adminProtectRoute, superAdminProtectRoute} = require("../middlewares/authentication.js");

// Controllers
const {
  adminRegister,
  DeleteUser,
  DeleteMultipleUsers,
  riderRegister,
  getRiders,
  getCustomer,
  getContractor,
  sendUserInvitation,
  getCustomerByName,
  updatePassword,
  verifyRiderEmail,
  resendVerificationOTP,

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
router.post("/rider/register", riderRegister);
router.post("/rider/otp-verify", protectRoute, verifyRiderEmail);
router.post("/rider/resend-otp", protectRoute, resendVerificationOTP);
router.get("/admins", superAdminProtectRoute, getAdmins);
router.get("/recent-customers", superAdminProtectRoute, getRecentCustomers);
router.get("/plan-counts", superAdminProtectRoute, getPlansCount);
router.get("/riders", adminProtectRoute, getRiders);
router.delete("/:userID", protectRoute, DeleteUser);       
router.post("/delete-account", protectRoute, DeleteOwnAccount);       
router.post("/detele-users", protectRoute, DeleteMultipleUsers);       
router.patch("/profile/:id", protectRoute, updateProfile); 
router.patch("/changePassword", protectRoute, updatePassword); 
router.get("/customer/:vat", protectRoute, getCustomer); 
router.get("/single-customer/:name", protectRoute, getCustomerByName); 
router.get("/contractor/:vat", protectRoute, getContractor); 

// Open Requests
router.post("/rider-register-user",  riderRegister);


// Send Invitation
router.post("/invitation", protectRoute,  sendUserInvitation);






router.get("/", protectRoute, getAllUsers);
router.get("/riders", protectRoute, getAllRiders);
router.put("/emailverify/:verifytoken", verifyUser);
router.post("/login", authUser);
router.post("/rider/login", authRiderUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetpassword);
router.get("/profile", protectRoute, getPorfile);
router.patch("/myProfile", protectRoute, updateOwnProfile);
router.patch("/registerFCMToken", protectRoute, registerFCMToken);    
router.patch("/updateRiderStatus/:userId", protectRoute, updateRiderStatus);
router.patch("/RejectRider/:userId", protectRoute, RejectRider);




module.exports = router;
