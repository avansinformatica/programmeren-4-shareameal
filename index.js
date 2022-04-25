const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const res = require("express/lib/response");
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

app.post("/api/user", (req, res) => {
  let user = req.body;
  id++;
  user = {
    id,
    ...user
  }
  console.log(user)
  database.push(user)
  res.status(201).json({
    status: 201,
    result: database
  })
})

app.get("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(`User with ID ${userId} searched`);
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

app.put("/api/user/:userId", (req, res, next) => {
  let updatedUser = req.body
  let updatedId = updatedUser.id
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    database.splice(database.indexOf(userId), 1);
    database.splice(updatedId, 1, updatedUser);

    console.log(`User with ID ${updatedUser.id} updated`);
    console.log(updatedUser);
    res.status(200).json({
      status: 200,
      result: updatedUser,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.delete("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    database.splice(database.indexOf(userId), 1)
    console.log(`User with ID ${userId} deleted`);
    res.status(201).json({
      status: 201,
      result: `User with ID ${userId} deleted`,
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
