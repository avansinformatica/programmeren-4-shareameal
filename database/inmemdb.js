// Deze variabelen worden niet geëxporteerd en kunnen dus niet

const { use } = require("chai")

// vanuit andere bestanden gewijzigd worden - alleen via de databasefuncties.
const database = []
const timeout = 500 // msec
let id = 0

// Dit is het object dat geexporteerd wordt, en dus in andere JavaScript bestanden geïmporteerd kan worden, via require.
module.exports = {
    /**
     * Maak een nieuwe user aan in de database. De email van de movie moet uniek zijn.
     *
     * @param {*} user De movie die we toevoegen
     * @param {*} callback De functie die ofwel een error, ofwel een resultaat teruggeeft.
     */
    addUser(user, callback) {
        console.log('addUser called')
        // we simuleren hier dat de database query 'lang' duurt, door een setTimeout toe te voegen.
        setTimeout(() => {

            if (
                user &&
                user.emailAdress &&
                database.filter((item) => item.name === user.emailAdress).length > 0
            ){
                const error = {
                    status: 400,
                    result: `Email ${user.emailAdress} already in use`,
                }
                console.log(error)
                callback(error, undefined)
            } else {
              newUser = {
                id: id++,
                ...user,
                isActive: false,
              };
        
              database.push(newUser);
        
              callback(undefined, newUser)
            }
        }, timeout)
    },

    /**
     * Retourneer een lijst van alle movies.
     * Om alle movies op te halen hebben we geen input param nodig,
     * dus alleen een callback als parameter.
     *
     * @param {*} callback De functie die het resultaat retourneert.
     */
    listUsers(callback) {
        console.log('listUsers called')
        setTimeout(() => {
            // roep de callback aan, zonder error, maar met de hele moviedb als result.
            callback(undefined, database)
        }, timeout)
    },

    getUserById(userId, callback) {
        setTimeout(() => {
            console.log(`User met ID ${userId} gezocht`);
            let user = database.filter((item) => item.id == userId);
            if (user.length > 0) {
              callback(undefined, user)
            } else {
                const error = {
                    status: 400,
                    result: `User with ID ${userId} not found`,
                }
                callback(error, undefined);
            }
        }, timeout)
    },

    updateUserById(userId, updateUser, callback) {
        setTimeout(() => {
            let validEmail = true;

            const otherUsers = database.filter((item) => item.id !== updateUser.id);
        
            otherUsers.forEach((u) => {
                if (u.emailAdress == updateUser.emailAdress) {
                    validEmail = false;
                }
            });    

            newUser = {
                userId,
                ...updateUser,
            }
          
            let selectedUser = database.filter((item) => item.id == userId);
          
            if (selectedUser != null && validEmail) {
                index = database.findIndex((obj) => obj.id == userId);
                database[index] = newUser;      

                callback(undefined, database)
            } else {
                const error = {
                    status: 404,
                    message: `User with ID ${userId} not found`,
                }
                callback(error, undefined)
            }}, timeout)
    },

    deleteUserById: (userId, callback) => {
        let remainingUsers = []
        setTimeout(() => {
            let user = database.filter((item) => item.id === userId);
        
            if (user.length > 0) {
                //make new array with all users except selected
                remainingUsers = database.filter((item) => item.id !== userId);
        
                res.status(200).json({
                    status: 200,
                    message: `User ${userId} succesfully removed`,
                });
            }    

            if (remainingUsers.length > 0) {
                callback(undefined, remainingUsers)
            } else {
                const error = {
                    status: 404,
                    message: `User with ID ${userId} not found`,
                }
                callback(error, undefined)
            }
        }, timeout)
    },
}