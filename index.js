const express = require('express')
// De database importeren we nu uit het externe bestand.
const database = require('./database/inmemdb')
const movieRoutes = require('./src/routes/movie.routes')

const app = express()
const port = process.env.PORT || 3000

// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

// express heeft tegenwoordig de bodyParser geïntegreerd.
// hoeft niet meer apart geïnstalleerd en geïmporteerd te worden.
app.use(express.json())

// let database = [];
let id = 0

app.all('*', (req, res, next) => {
    const method = req.method
    console.log(`Method ${method} is aangeroepen`)
    next()
})

// Alle movieRoutes beginnen met /api
app.use('/api', movieRoutes)

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
