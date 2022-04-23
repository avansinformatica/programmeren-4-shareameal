const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let databaseUser = [];
let idUser = 0;

// let databaseMovie = [];
// let idMovie = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

// UC-201 Register as a new user
app.post("/api/user", (req, res) => {
  let user = req.body;
  // idUser++;

  user = {
    idUser,
    ...user,
  };

  console.log(user);
  console.log(
    "Contains: " +
      databaseUser.some((item) => item.emailAdress == user.emailAdress)
  );

  if (databaseUser.some((item) => item.emailAdress == user.emailAdress)) {
    res.status(401).send("Forbidden.");
  } else {
    databaseUser.push(user);
    res.status(201).json({
      id: idUser,
      firstName: user.firstName,
      lastName: user.lastName,
      street: user.lastName,
      city: user.city,
      isActive: true,
      emailAdress: user.emailAdress,
      password: user.password,
      phoneNumber: user.phoneNumber,
    });
  }
  idUser++;
});

// UC-202 Get all users
app.get("/api/user", (req, res) => {
  res.status(201).json({
    result: databaseUser,
  });
});

// UC-203 Request personal user profile
app.get("/api/user/profile", (req, res) => {
  res.status(401).send("Deze functionaliteit is nog niet gerealiseerd.");
});

// UC-204 Get single user by ID
app.get("/api/user/:getsingleuserbyid", (req, res) => {
  const getsingleuserbyid = req.params.getsingleuserbyid;
  console.log(`User met ID ${getsingleuserbyid} gezocht`);
  let user = databaseUser.filter((item) => item.idUser == getsingleuserbyid);
  if (user.length > 0) {
    console.log(user);
    res.status(201).json({
      result: user,
    });
  } else {
    res.status(403).send("Forbidden, no access.");
  }
});

// UC-205 Update a single user
app.put("/api/user/:putsingleuserbyid", (req, res) => {
  const putsingleuserbyid = req.params.putsingleuserbyid;
  let updatedUser = { idUser: putsingleuserbyid, ...req.body };
  console.log(`User met ID ${putsingleuserbyid} aangepast`);

  let index = databaseUser.findIndex(
    (user) => user.idUser == putsingleuserbyid
  );

  if (index == -1) {
    res.status(403).send("Forbidden.");
  } else {
    databaseUser[index] = updatedUser;
    res.status(201).json({
      result: updatedUser,
    });
  }
});

// app.get("/api/movie/:movieId", (req, res, next) => {
//   const movieId = req.params.movieId;
//   console.log(`Movie met ID ${movieId} gezocht`);
//   let movie = databaseMovie.filter((item) => item.idMovie == movieId);
//   if (movie.length > 0) {
//     console.log(movie);
//     res.status(200).json({
//       status: 200,
//       result: movie,
//     });
//   } else {
//     res.status(401).json({
//       status: 401,
//       result: `Movie with ID ${movieId} not found`,
//     });
//   }
// });

// app.get("/api/movie", (req, res, next) => {
//   res.status(200).json({
//     status: 200,
//     result: databaseMovie,
//   });
// });

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
