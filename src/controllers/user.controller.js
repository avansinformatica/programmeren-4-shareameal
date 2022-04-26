let database = [];
let id = 0;

let controller = {
  addUser: (req, res) => {
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
  },
  getAllUsers: (req, res) => {
    res.status(200).json({
      status: 200,
      result: database,
    });
  },
  getUserById: (req, res) => {
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
  },
};

module.exports = controller;
