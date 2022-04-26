const express = require('express')
const movieController = require('../controllers/movie.controller')
const router = express.Router()

router.post('/movie', movieController.createMovie)
router.get('/movie', movieController.getAll)
router.get('/movie/:movieId', movieController.getById)

module.exports = router
