const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

console.log(`--DB_PASSWORD = ${process.env.npm_config_DB_PASSWORD}`)
console.log(`--DB_PASSWORD = ${process.env.DB_PASSWORD}`)
console.log(`--DB_NAME = ${process.env.npm_config_DB_NAME}`)
console.log(`--DB_NAME = ${process.env.DB_NAME}`)

describe('Movies API', () => {
    describe('UC201 Create movie', () => {
        beforeEach((done) => {
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    'SELECT id, name FROM meal;',
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done()
                    }
                )
            })
        })

        it('TC-201-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .post('/api/movie')
                // Hier gebruiken we de synchrone jwt.sign om een token te krijgen
                // zodat we simuleren dat we als user met id=1 ingelogd zijn
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
})
