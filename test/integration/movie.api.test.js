const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')

chai.should()
chai.use(chaiHttp)

console.log(`In movie.api.test: DB_PASSWORD = ${process.env.DB_PASSWORD}`)

describe('Movies API', () => {
    describe('UC201 Create movie', () => {
        beforeEach((done) => {
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            // ToDo
            done()
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
