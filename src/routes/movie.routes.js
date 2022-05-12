const express = require('express')
const movieController = require('../controllers/movie.controller')
const authController = require('../controllers/authentication.controller')
const router = express.Router()

router.post(
    '/movie',
    authController.validateToken,
    movieController.validateMovie,
    movieController.createMovie
)
router.get('/movie', authController.validateToken, movieController.getAll)
router.get(
    '/movie/:movieId',
    authController.validateToken,
    movieController.getById
)

module.exports = router
