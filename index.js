const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let movies = [];
let id = 0;

let users = [];

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

//Movies
app.post("/api/movie", (req, res) => {
  let movie = req.body;
  id++;
  movie = {
    id,
    ...movie,
  };
  console.log(movie);
  movies.push(movie);
  res.status(201).json({
    status: 201,
    result: movies,
  });
});

app.get("/api/movie/:movieId", (req, res, next) => {
  const movieId = req.params.movieId;
  console.log(`Movie met ID ${movieId} gezocht`);
  let movie = movies.filter((item) => item.id == movieId);
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

app.get("/api/movie", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: movies,
  });
});

//Users
app.post("/api/user", (req, res) => {
  let user = req.body;
  user = {
    ...user,
  };
  console.log(user);
  users.push(user);

  let validEmail;

  users.forEach(u => {
    if (u.getString("emailAdress") == user.getString("emailAdress")) {
      res.status(401).json({
        status: 401,
        result: "Not an unique email",
      });
      validEmail = false;
    } else {
      validEmail = true;
    }
  });

  if (validEmail == true) {
    res.status(201).json({
      status: 201,
      result: users,
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
