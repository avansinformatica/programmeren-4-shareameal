const express = require('express')
const movieRoutes = require('./src/routes/movie.routes')
const dbconnection = require('./database/dbconnection')
require('dotenv').config()

const port = process.env.PORT
const app = express()
app.use(express.json())

app.all('*', (req, res, next) => {
    const method = req.method
    console.log(`Method ${method} is aangeroepen`)
    next()
})

// Alle routes beginnen met /api
app.use('/api', movieRoutes)

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

// Hier moet je nog je Express errorhandler toevoegen.
app.use((err, req, res, next) => {
    console.log('Error handler called.')
    res.status(500).json({
        statusCode: 500,
        message: err.toString(),
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server')
    dbconnection.end((err) => {
        console.log('Database connection closed')
    })
    app.close(() => {
        console.log('HTTP server closed')
    })
})

// we exporteren de Express app server zodat we die in
// de integration-testcases kunnen gebruiken.
module.exports = app
