const express = require('express')
// De database importeren we nu uit het externe bestand.
const database = require('./database/inmemdb')

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

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        result: 'Hello World',
    })
})

app.post('/api/movie', (req, res) => {
    // Hier gebruiken we nu de inmem database module om een movie toe te voegen.
    // Optie: check vooraf of req.body wel de juiste properties/attribute bevat - gaan we later doen

    // We geven in de createMovie functie de callbackfunctie mee. Die kan een error of een result teruggeven.
    database.createMovie(req.body, (error, result) => {
        if (error) {
            console.log(`index.js: ${error}`)
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
})

app.get('/api/movie/:movieId', (req, res, next) => {
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
})

app.get('/api/movie', (req, res, next) => {
    database.listMovies((error, result) => {
        res.status(200).json({
            statusCode: 200,
            result,
        })
    })
})

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
