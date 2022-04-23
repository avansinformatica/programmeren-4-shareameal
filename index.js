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

/* //Movies
app.post("/api/movie", (req, res) => {
  let movie = req.body;
  movieID++;
  movie = {
    movieID,
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
  console.log(`Movie with ID ${movieId} searched`);
  let movie = movies.filter((item) => item.movieID == movieId);
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
}); */


//Users
app.post("/api/user", (req, res) => {
  let user = req.body;

  let validEmail = true;

  database.forEach((u) => {
    if (u.emailAddress === user.emailAddress) {
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
});

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
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

//UC-206 Delete a user
  app.delete("/api/user/:id", (req, res) => {
    const userId = Number(req.params.id);
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