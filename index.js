const express = require('express')
const authRoutes = require('./src/routes/authentication.routes')
const movieRoutes = require('./src/routes/movie.routes')
const dbconnection = require('./src/database/dbconnection')
const logger = require('./src/config/config').logger
require('dotenv').config()

const port = process.env.PORT
const app = express()
app.use(express.json())

app.all('*', (req, res, next) => {
    const method = req.method
    logger.debug(`Method ${method} is aangeroepen`)
    next()
})

// Alle routes beginnen met /api
app.use('/api', movieRoutes)
app.use('/api', authRoutes)

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

// Hier moet je nog je Express errorhandler toevoegen.
app.use((err, req, res, next) => {
    logger.debug('Error handler called.')
    res.status(500).json({
        statusCode: 500,
        message: err.toString(),
    })
})

app.listen(port, () => {
    logger.debug(`Example app listening on port ${port}`)
})

process.on('SIGINT', () => {
    logger.debug('SIGINT signal received: closing HTTP server')
    dbconnection.end((err) => {
        logger.debug('Database connection closed')
    })
    app.close(() => {
        logger.debug('HTTP server closed')
    })
})

// we exporteren de Express app server zodat we die in
// de integration-testcases kunnen gebruiken.
module.exports = app
