const express = require('express')
const movieRoutes = require('./src/routes/movie.routes')
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// we exporteren de Express app server zodat we die in
// de integration-testcases kunnen gebruiken.
module.exports = app
