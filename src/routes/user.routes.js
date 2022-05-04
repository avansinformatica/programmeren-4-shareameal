const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

let database = [];
let id = 0;

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

// IN CONTROLLER UC-201 Register as a new user
router.post("/api/user", userController.validateUser, userController.addUser);

// IN CONTROLLER UC-202 Get all users
router.get("/api/user", userController.getAllUsers);

// IN CONTROLLER UC-204 Get singel user by ID
router.get("/api/user/:userId", userController.getUserById);

// NOT! IN CONTROLLER YET!!!!!!!!!!!!
// UC-203 Request personal user profile
//    de user is ingelogd, het request bevat
//    een JWT met userId
//    - Error response: code 401 statusCode
//      + message
router.get("/api/user/profile", (req, res, next) => {
  res.status(404).json({
    status: 404,
    result: `Dit endpoint is nog niet gerealiseerd`,
  });
});

// IN CONTROLLER
// UC-205 Update a single user
router.put("/api/user/:userId", userController.updateSingleUser);

// IN CONTROLLER
// UC-206 Delete a user
router.delete("/api/user/:userId", userController.deleteSingleUser);

module.exports = router;
