const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

// UC-201 Register as a new user
//    - emailAdress is uniek
//    - Error response: als emailAdress niet
//      uniek: user is niet toegevoegd in
//      database statusCode + message
//      geretourneerd
//    - Succes response: user is toegevoegd
//      in database, userdata inclusief id
//      wordt geretourneerd.

app.post("/api/user", (req, res) => {
  let user = req.body;
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
});

// UC-204 Get singel user by ID

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
});

// UC-202 Get all users
//    - Succes response: code 200 result:
//      result: nul of meer userobjecten
//      in een array

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

// UC-203 Request personal user profile
//    de user is ingelogd, het request bevat
//    een JWT met userId
//    - Error response: code 401 statusCode
//      + message

app.get("/api/user/profile", (req, res, next) => {
  res.status(404).json({
    status: 404,
    result: `Dit endpoint is nog niet gerealiseerd`,
  });
});

// UC-205 Update a single user
app.put("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} wordt gezocht`);
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    // database.spilce(userId, 0, user); // Update info form user.
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
});

// UC-206 Delete a user

app.delete("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} wordt gezocht om te verwijderen`);
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    let lists = list.filter((x) => {
      return x.Id != userId;
    });
    database = lists;
    res.status(200).json({
      status: 200,
      result: database,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
