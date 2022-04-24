const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

/* let movies = [];
let movieID = 0; */

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is called`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//------------------------------------------------------------------ Users -----------------------------------------------------------------------

//UC-201 Add a user
  app.post("/api/user", (req, res) => {
    let user = req.body;
    let validEmail = true;

    //Email validation
    database.forEach((u) => {
      if (u.emailAddress == user.emailAddress) {
          validEmail = false;
      }
    });

    if (validEmail) {

      id++;
      user = {
        id,
        ...user,
      };

      console.log(user);
      database.push(user);

      res.status(201).json({
        status: 201,
        result: database,
      });

    } else {
      res.status(401).json({
          status: 401,
          message: `Email ${user.emailAddress} already in use.`,
      });
  }

  res.end();
  });

//UC-202 Get all users
  app.get("/api/user", (req, res, next) => {
    res.status(200).json({
      status: 200,
      result: database,
    });
    res.end();
  });

//UC-203 Request personal user profile
  app.get("/api/user/profile", (req, res) => {
    res.status(200).json({
        code: 200,
        message: "This functionality hasn't been added yet.",
    });

    res.end();
  });

 //UC-204 Get info of specific user 
  app.get("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
    res.end();
  });

//UC-205 Update a user
  app.put("/api/user/:id", (req, res) => {
    const userId = req.params.id;

    let user = req.body;
    let validEmail = true;

    newUser = {
      userId,
      ...user,
    }

    const otherUsers = database.filter((item) => item.id !== userId);

    otherUsers.forEach((u) => {
        if (u.emailAddress == newUser.emailAddress) {
            validEmail = false;
        }
    });    

    let selectedUser = database.filter((item) => item.id == userId);

    if (selectedUser != null && validEmail) {
      index = database.findIndex((obj) => obj.id == userId);
      database[index] = newUser;

      res.status(201).json({
          status: 201,
          result: `User ${userId} succesfully updated.`,
      });
    } else if (selectedUser != null && !validEmail) {
      res.status(400).json({
      status: 400,
      message: `Email ${newUser.emailAddress} is already in use.`,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
    res.end();
  });

//UC-206 Delete a user
  app.delete("/api/user/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    let user = database.filter((item) => item.id === userId);

    if (user.length > 0) {
        //make new array with all users except selected
        database = database.filter((item) => item.id !== userId);

        res.status(200).json({
            status: 200,
            message: `User ${userId} succesfully removed`,
        });
    } else {
        res.status(401).json({
            status: 401,
            message: `Can't find user ${userId}`,
        });
    }
    res.end();
  });

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});