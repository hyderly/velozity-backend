const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/UserModel.js");

const protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = await jwt.verify(token, process.env.jwt_secret);
      req.user = await UserModel.findById(decodedToken.id);
      next();
    } catch (error) {
      res.status(400);
      throw new Error("Invalid Token");
    }
  }

  if (!token) {
    res.status(400);
    throw new Error("Token not found");
  }
});

const adminProtectRoute = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = await jwt.verify(token, process.env.jwt_secret);


      if (!decodedToken || !decodedToken.id) {
        res.status(403); // Forbidden
        throw new Error("Invalid Token");
      }

      const user = await UserModel.findById(decodedToken.id);

      if (!user) {
        res.status(403); // Forbidden
        throw new Error("User not found");
      }

      // Check if the user role is "admin"
      if (user.userType === "admin") {
        req.user = await UserModel.findById(decodedToken.id);
        next();
      } else {
        res.status(403); // Forbidden
        throw new Error("Access Denied. User is not a admin.");
      }
    } catch (error) {
      res.status(403); // Forbidden
      throw new Error("Access Denied. " + error.message);
    }
  }

  if (!token) {
    res.status(400);
    throw new Error("Token not found");
  }
});

const superAdminProtectRoute = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = await jwt.verify(token, process.env.jwt_secret);


      if (!decodedToken || !decodedToken.id) {
        res.status(403); // Forbidden
        throw new Error("Invalid Token");
      }

      const user = await UserModel.findById(decodedToken.id);

      if (!user) {
        res.status(403); // Forbidden
        throw new Error("User not found");
      }

      // Check if the user role is "super-admin"
      if (user.userType === "super-admin") {
        req.user = await UserModel.findById(decodedToken.id);
        next();
      } else {
        res.status(403); // Forbidden
        throw new Error("Access Denied. User is not a super-admin.");
      }
    } catch (error) {
      res.status(403); // Forbidden
      throw new Error("Access Denied. " + error.message);
    }
  }

  if (!token) {
    res.status(400);
    throw new Error("Token not found");
  }
});




module.exports = {
  protectRoute,
  adminProtectRoute,
  superAdminProtectRoute
};
