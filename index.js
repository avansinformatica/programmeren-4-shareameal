const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const FORBIDDEN_TERMINAL_CHARACTERS = [
  `!`,
  `#`,
  `$`,
  `%`,
  `&`,
  `'`,
  `*`,
  `+`,
  `-`,
  `/`,
  `=`,
  `?`,
  `^`,
  `_`,
  "`",
  `{`,
  `|`,
  `}`,
  `~`,
];

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

// movie functions
app.post("/api/movie", (req, res) => {
  let movie = req.body;
  id++;
  movie = {
    id,
    ...movie,
  };
  console.log(movie);
  database.push(movie);
  res.status(201).json({
    status: 201,
    result: database,
  });
});

app.get("/api/movie", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.get("/api/movie/:movieId", (req, res, next) => {
  const movieId = req.params.movieId;
  console.log(`Movie met ID ${movieId} gezocht`);
  let movie = database.filter((item) => item.id == movieId);
  if (movie.length > 0) {
    console.log(movie);
    res.status(200).json({
      status: 200,
      result: movie,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `Movie with ID ${movieId} not found`,
    });
  }
});

// user functions
app.post("/api/user", (req, res) => {
  let user = req.body;
  let existingUsers = database.filter((item) => item.email == user.email);
  if (emailIsValid(user.email) && !existingUsers.length > 0) {
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
      result: `Email address ${user.email} is not valid or already exists`,
    });
  }
});

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.get("/api/user/profile", (req, res, next) => {
  res.status(401).json({
    status: 401,
    result: "Functionality has not yet been realized",
  });
});

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

app.put("/api/user/:userId", (req, res, next) => {
  let user = req.body;
  const userId = req.params.userId;
  if (emailIsValid(user.email)) {
    id++;
    database.splice(userId - 1, 1);
    let uId = parseInt(userId);
    user = {
      id: uId,
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
      result: `Email address ${user.email} is not valid`,
    });
  }
});

app.delete("/api/user/:userId", (req, res) => {
  let user = req.body;
  const userId = req.params.userId;
  let existingUsers = database.filter((item) => item.id == userId);
  let uId = parseInt(userId);
  if (existingUsers.length > 0) {
    uId -= id;
    database.splice(uId - 1, 1);
    user = {
      id,
      ...user,
    };
    console.log(user);
    res.status(201).json({
      status: 201,
      result: database,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User does not exist`,
    });
  }
});

let emailIsValid = (email) => {
  let syntaxGood = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!syntaxGood) return false; // skip loop if we've already failed

  for (let badChar of FORBIDDEN_TERMINAL_CHARACTERS) {
    if (email.startsWith(badChar) || email.endsWith(badChar)) {
      return false; // terminate early
    }
  }

  return true;
};

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
