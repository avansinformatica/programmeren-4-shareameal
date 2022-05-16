const assert = require('assert');
const dbconnection = require('../../database/dbconnection')

let controller = {
    validateUser:(req, res, next) => {
        let user = req.body;
        let{firstName, 
            lastName, 
            street, 
            city, 
            emailAdress, 
            password, 
            phoneNumber} = user;

    
        try {
            assert(typeof firstName === 'string', 'First name must be a string')
            assert(typeof lastName === 'string', 'Last name must be a string')
            assert(typeof street === 'string', 'Street must be a string')
            assert(typeof city === 'string', 'City must be a string')
            assert(typeof emailAdress === 'string', 'Email must be a string')
            assert(typeof password === 'string', 'Password must be a string')
            // assert(typeof phoneNumber === 'string', 'Phonenumber must be a string')

        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error)
        }
        next();
    },

    validateUserUpdate:(req, res, next) => {
        let user = req.body;
        let{firstName, 
            lastName, 
            street, 
            city, 
            emailAdress, 
            password, 
            phoneNumber} = user;

    
        try {

            assert(typeof emailAdress === 'string', 'Email must be a string')

        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error)
        }
        next();
    },

    userExists: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            const id = req.params.userId;

            if(isNaN(id)){ 
                return next()
            } 
            connection.query(
                'SELECT COUNT(id) as count FROM user WHERE id = ?', `${id}`,
                function (err, results, fields) {

                    if (err) throw err;

                    if (results[0].count === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "User does not exist",
                        });
                    } else {
                        next();
                    }
                });
        });
    },

    addUser:(req, res) => {
   
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let user = req.body;

            connection.query(
                'SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?', user.emailAdress,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    if (results[0].count > 0) {
                        res.status(409).json({
                            status: 409,
                            message: `Email is already in use.`,
                        });
                    } else {
                        connection.query(
                            `INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES ('${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.password}', '${user.emailAdress}')`,
                            function (error, results, fields) {       
                                if (error) throw error;
                                if (results.affectedRows > 0) {

                                connection.query("SELECT * FROM user WHERE emailAdress = ?", user.emailAdress, function(error, results, fields) {
                                    if (error) throw error;
                                    connection.release();

                                    if (results[0].isActive === 1) {
                                        results[0].isActive = true;
                                    } else {
                                        results[0].isActive = false;
                                    }

                                    res.status(201).json({
                                        status: 201,
                                        result: results[0],
                                    });
                                })
                                                          
                                }
                            });
                    }
                });
        });
    },

    getAllUsers:(req, res) => {
        let {firstName, isActive} = req.query
        console.log(`name = ${firstName} isActive ${isActive}`)

        let queryString = 'SELECT * FROM `user`'
        if (firstName || isActive) {
            queryString += ' WHERE '
            if (firstName) {
                queryString += '`firstName` LIKE ?'
                firstName = '%' + firstName + '%'
            }
            if (firstName && isActive) {
                queryString += ' AND '
            }
            if (isActive) {
                queryString += `isActive = '${isActive}'`
            }
        }

        console.log(queryString);

        dbconnection.getConnection(function(err, connection) {
            if (err){
                next(err)
            }; // not connected!
           
            // Use the connection
            connection.query(queryString, [firstName, isActive], function (error, results, fields) {
              // When done with the connection, release it.
              connection.release();
           
              // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
              console.log('#results = ', results.length)
              res.status(200).json({
                  statusCode: 200,
                  result: results
              })
        
            });
        });
    },

    getUserProfile:(req, res) => {
        res.status(200).json({
            code: 200,
            message: "This functionality hasn't been added yet.",
        });
    },

    getUserById:(req, res, next) => {
        console.log("getUserById reached");
        dbconnection.getConnection(function (error, connection) {
            if (error) throw error;

            const userId = req.params.userId

            if(isNaN(userId)) {
                return next();
            }

            connection.query("SELECT COUNT(id) as count FROM user WHERE id =?", userId,  function (error, results, fields) {
                if (error) throw error;
                if(!results[0].count) {
                    return next({
                        status: 404,
                        message: `User doesn't exist`,
                    });
                } else {
                    connection.query( 'SELECT * FROM user WHERE id = ?', userId, function (error, results, fields) {
                        if (error) throw error;
                        
                        connection.release();
    
                        console.log('#results = ', results.length);
                        res.status(200).json({
                            status: 200,
                            result: results[0],
                        });
                    });
                }
            });
        });
    },

    updateUser:(req, res, next) => {
        //create connection
        dbconnection.getConnection((err, connection) => {
            //throw error if something went wrong
            if (err) throw err;
    
            //save parameter (id) in variable
            const id = Number(req.params.id);
    
            const newUser = req.body;
    
            //check if parameter is a number
            if (isNaN(id)) {
                return next();
            }
    
            //set user object with given request body
            let user = req.body;
    
            connection.query("SELECT * FROM user WHERE id = ?", id, (err, results, fields) => {
                //throw error if something went wrong
                if (err) throw err;
    
                //store old data
                const oldUser = results[0];
    
                //if user exists
                if (results[0]) {
                    connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ? AND id <> ?", [oldUser.emailAdress, id], (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;
    
                        //store if email is valid or not, can either be 0 or 1
                        const unValidEmail = results[0].count;
    
                        if (!unValidEmail) {
                            //put request body in a variable
    
                            const user = {
                                ...oldUser,
                                ...newUser,
                            };
    
                            const { firstName, lastName, emailAdress, password, street, city } = user;
    
                            //update user
                            connection.query("UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ?", [firstName, lastName, emailAdress, password, street, city, id], (err, results, fields) => {
                                //throw error if something went wrong
                                if (err) throw err;
    
                                //close connection
                                connection.release();
    
                                //return successful status + updated user
                                res.status(200).json({
                                    status: 200,
                                    result: user,
                                });
    
                                //end response process
                                // res.end();
                            });
                        } else {
                            //return false status if email is already in use by another user
                            return next({
                                status: 409,
                                message: `Email is already in use`,
                            });
                        }
                    });
                } else {
                    //if the user isn't found return a fitting error response
                    return next({
                        status: 400,
                        message: `User doesn't exist`,
                    });
                }
            });
        });
},
    deleteUser:(req, res, next) => {
        console.log("deleteUser reached");
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const userId = Number(req.params.userId);

            if (isNaN(userId)) {
                next()
            }

            connection.query(
                `DELETE FROM user WHERE id = '${userId}'`,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200,
                        message: "User has been deleted",
                    });

                    res.end();
                });

        });
    },
}

module.exports = controller;