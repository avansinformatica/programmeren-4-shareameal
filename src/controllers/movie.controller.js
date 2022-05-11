const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

/**
 * We exporteren hier een object. Dat object heeft attributen met een waarde.
 * Die waarde kan een string, number, boolean, array, maar ook een functie zijn.
 * In dit geval zijn de attributen functies.
 */
module.exports = {
    // createMovie is een attribuut dat als waarde een functie heeft.
    createMovie: (req, res, next) => {
        // Hier gebruiken we nu de inmem database module om een movie toe te voegen.
        // Optie: check vooraf of req.body wel de juiste properties/attribute bevat - gaan we later doen

        // We geven in de createMovie functie de callbackfunctie mee. Die kan een error of een result teruggeven.
        database.createMovie(req.body, (error, result) => {
            if (error) {
                console.log(`index.js : ${error}`)
                res.status(401).json({
                    statusCode: 401,
                    error, // als de key en de value het zelfde kun je die zo vermelden. Hier staat eigenlijk: error: error
                })
            }
            if (result) {
                console.log(`index.js: movie successfully added!`)
                res.status(200).json({
                    statusCode: 200,
                    result,
                })
            }
        })
    },

    getById: (req, res, next) => {
        const movieId = req.params.movieId
        console.log(`Movie met ID ${movieId} gezocht`)
        let movie = database.filter((item) => item.id == movieId)
        if (movie.length > 0) {
            console.log(movie)
            res.status(200).json({
                status: 200,
                result: movie,
            })
        } else {
            res.status(401).json({
                status: 401,
                result: `Movie with ID ${movieId} not found`,
            })
        }
    },

    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')

        const queryParams = req.query
        console.log(queryParams)

        let { name, isActive } = req.query
        let queryString = 'SELECT `id`, `name` FROM `meal`'
        if (name || isActive) {
            queryString += ' WHERE '
            if (name) {
                queryString += '`name` LIKE ?'
                name = '%' + name + '%'
            }
            if (name && isActive) queryString += ' AND '
            if (isActive) {
                queryString += '`isActive` = ?'
            }
        }
        queryString += ';'
        console.log(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                queryString,
                [name, isActive],
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) next(error)

                    // Don't use the connection here, it has been returned to the pool.
                    console.log('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    validateMovie: (req, res, next) => {
        // We krijgen een movie object binnen via de req.body.
        // Dat object splitsen we hier via object decomposition
        // in de afzonderlijke attributen.
        const { title, year, studio } = req.body
        try {
            // assert is een nodejs library om attribuutwaarden te valideren.
            // Bij een true gaan we verder, bij een false volgt een exception die we opvangen.
            assert.equal(typeof title, 'string', 'title must be a string')
            assert.equal(typeof year, 'number', 'year must be a number')
            // als er geen exceptions waren gaan we naar de next routehandler functie.
            next()
        } catch (err) {
            // Hier kom je als een assert failt.
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            // Hier geven we een generiek errorobject terug. Dat moet voor alle
            // foutsituaties dezelfde structuur hebben. Het is nog mooier om dat
            // via de Express errorhandler te doen; dan heb je één plek waar je
            // alle errors afhandelt.
            // zie de Express handleiding op https://expressjs.com/en/guide/error-handling.html
            res.status(400).json({
                statusCode: 400,
                error: err.message,
            })
        }
    },
}
