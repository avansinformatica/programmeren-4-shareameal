const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');


router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Welcome to Juliet's share a meal server",
    });
  });

//UC-201 Add a user
router.post("/api/user", userController.validateEmail, userController.validateUser, userController.addUser);

//UC-202 Get all users
router.get("/api/user", userController.getAllUsers);

//UC-203 Request personal user profile
router.get("/api/user/profile", userController.getUserProfile);

//UC-204 Get info of specific user 
router.get("/api/user/:userId", userController.getUserById);

//UC-205 Update a user
router.put("/api/user/:id", userController.canUpdate, userController.validateUser, userController.updateUser);

//UC-206 Delete a user
router.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;