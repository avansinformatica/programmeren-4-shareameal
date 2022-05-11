process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Movies API', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        console.log(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        console.log('before done')
        done()
    })

    describe('UC201 Create movie', () => {
        //
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        it('TC-201-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .post('/api/movie')
                .send({
                    // name is missing
                    year: 1234,
                    studio: 'pixar',
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('title must be a string')

                    done()
                })
        })

        it('TC-201-2 should return a valid error when postal code is invalid', (done) => {
            // Zelf verder aanvullen
            done()
        })

        // En hier komen meer testcases
    })

    describe('UC-303 Lijst van maaltijden opvragen /api/meal', () => {
        //
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()
                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        it('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    const { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })
        // En hier komen meer testcases
    })
})
