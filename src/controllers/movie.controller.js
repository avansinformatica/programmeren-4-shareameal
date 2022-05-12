const dbconnection = require('../database/dbconnection')
const logger = require('../config/config').logger
const assert = require('assert')

/**
 * We exporteren hier een object. Dat object heeft attributen met een waarde.
 * Die waarde kan een string, number, boolean, array, maar ook een functie zijn.
 * In dit geval zijn de attributen functies.
 */
module.exports = {
    // createMovie is een attribuut dat als waarde een functie heeft.
    createMovie: (req, res, next) => {
        logger.debug(`index.js: movie successfully added!`)
        res.status(200).json({
            statusCode: 200,
            result,
        })
    },

    getById: (req, res, next) => {
        const movieId = req.params.movieId
        logger.debug(`Movie met ID ${movieId} gezocht`)
        let movie = database.filter((item) => item.id == movieId)
        if (movie.length > 0) {
            logger.debug(movie)
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
        logger.debug(`getAll aangeroepen. req.userId = ${req.userId}`)

        const queryParams = req.query
        logger.debug(queryParams)

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
        logger.debug(`queryString = ${queryString}`)

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
                    logger.debug('#results = ', results.length)
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
            logger.debug(`Error message: ${err.message}`)
            logger.debug(`Error code: ${err.code}`)
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
