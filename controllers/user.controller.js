const assert = require('assert');
let database = [];
let id = 0;
let validEmail = true;

let controller = {
    validateEmail:(req, res, next) =>{
        let user = req.body;

        database.forEach((u) => {
            if (u.emailAdress == user.emailAdress) {
                validEmail = false;
            }
        });  

        next();
    },

    validateUser:(req, res, next) => {
        let user = req.body;
        let{firstName, 
            lastName, 
            street, 
            city, 
            emailAdress, 
            password, 
            phoneNumber} = user;

            console.log(user);
        try {
            assert(typeof firstName === 'string', 'First name must be a string')
            assert(typeof lastName === 'string', 'Last name must be a string')
            assert(typeof street === 'string', 'Street must be a string')
            assert(typeof city === 'string', 'City must be a string')
            if (validEmail) {
                assert(typeof emailAdress === 'string', 'Email must be a string')
            }
            assert(typeof password === 'string', 'Password must be a string')
            assert(typeof phoneNumber === 'string', 'Phonenumber must be a string')

        } catch (err) {
            const error = {
                status: 400,
                result: err.message,
            };
            next(error)
        }
        next();
    },

    addUser:(req, res, next) => {
        let user = req.body;
    
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
            const error = {
                status: 400,
                result: `Email ${user.emailAdress} already in use`,
            }
            next(error);
        }
    },

    getAllUsers:(req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
          });
    },

    getUserProfile:(req, res) => {
        res.status(200).json({
            code: 200,
            message: "This functionality hasn't been added yet.",
        });
    },

    getUserById:(req, res, next) => {
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
            const error = {
                status: 400,
                result: `Movie with ID ${userId} not found`,
            }
            next(error);
        }
    },

    canUpdate:(req, res) => {
        let user = req.body;
        let validEmail = true;

        const otherUsers = database.filter((item) => item.id !== user.id);
    
        otherUsers.forEach((u) => {
            if (u.emailAdress == newUser.emailAdress) {
                validEmail = false;
            }
        });    
    },

    updateUser:(req, res, next) => {
        const userId = req.params.id;
        let user = req.body;
    
        newUser = {
          userId,
          ...user,
        }
    
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
          message: `Email ${newUser.emailAdress} is already in use.`,
          });
        } else {
            const error = {
                status: 400,
                result: `Movie with ID ${userId} not found`,
            }
            next(error);
        }
    },

    deleteUser:(req, res, next) => {
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
            const error = {
                status: 400,
                result: `Movie with ID ${userId} not found`,
            }
            next(error);
        }
    }
}

module.exports = controller;