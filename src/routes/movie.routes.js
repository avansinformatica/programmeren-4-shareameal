const express = require("express");
const router = express.Router();

let databaseUser = [];
let idUser = 0;

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

// UC-201 Register as a new user
router.post("/api/user", (req, res) => {
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
    idUser++;
  }
});

// UC-202 Get all users
router.get("/api/user", (req, res) => {
  res.status(201).json({
    result: databaseUser,
  });
});

// UC-203 Request personal user profile
router.get("/api/user/profile", (req, res) => {
  res.status(401).send("Deze functionaliteit is nog niet gerealiseerd.");
});

// UC-204 Get single user by ID
router.get("/api/user/:id", (req, res) => {
  const getsingleuserbyid = req.params.id;
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
router.put("/api/user/:id", (req, res) => {
  const putsingleuserbyid = req.params.id;
  let updatedUser = { idUser: putsingleuserbyid, ...req.body };
  console.log(`User met ID ${putsingleuserbyid} aangepast`);

  let index = databaseUser.findIndex(
    (user) => user.idUser == putsingleuserbyid
  );

  console.log("Index van user = " + index);

  if (index == -1) {
    res.status(403).send("Forbidden.");
  } else {
    databaseUser[index] = updatedUser;
    res.status(201).json({
      result: updatedUser,
    });
  }
});

// UC-206 Delete an user
router.delete("/api/user/:id", (req, res) => {
  const deletesingleuserbyid = req.params.id;
  console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

  let index = databaseUser.findIndex(
    (user) => user.idUser == deletesingleuserbyid
  );
  let user = databaseUser.filter((item) => item.idUser == deletesingleuserbyid);

  console.log("Index van user = " + index);

  if (index == -1) {
    res.status(403).send("Forbidden.");
  } else {
    databaseUser.splice(index, 1);
    res.status(201).json({
      result: user,
    });
  }
});

module.exports = router;
