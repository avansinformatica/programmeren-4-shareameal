const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/authentication.controller");
const authenticationController = require("../controllers/authentication.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

// UC-201 Register as a new user
router.post("/api/user", userController.validateUser, userController.addUser);

// UC-202 Get all users
router.get(
  "/api/user",
  authenticationController.validateToken,
  userController.getAllUsers
);

// UC-203 Request personal user profile
router.get(
  "/api/user/profile",
  authenticationController.validateToken,
  userController.getUserProfile
);

// UC-204 Get singel user by ID
router.get(
  "/api/user/:userId",
  authenticationController.validateToken,
  userController.getUserById
);

// UC-205 Update a single user
router.put(
  "/api/user/:userId",
  userController.validateUser,
  userController.updateSingleUser
);

// UC-206 Delete a user
router.delete("/api/user/:userId", userController.deleteSingleUser);

module.exports = router;
