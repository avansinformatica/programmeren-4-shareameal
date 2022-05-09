process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../database/dbconnection");
//let database = []; // is de test database //

chai.should();
chai.use(chaiHttp);



/**
  * Db queries to clear and fill the test database before each test.
  */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"




// UC-101 Login
describe("Manage users", () => {
  describe("UC-201 add users /api/user", () => {
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
    });

    //it.only when you only want to run this test
    //it.skip if you only want to skip this test
    it("UC-201-1 When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //first name ontbreekt
          lastName: "Wante",
          emailAdress: "wante@student.avans.nl",
          password: "P@ssw0rd123",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("First Name must be a string");
          done();
        });
    });

    it("UC-201-2 When a non-valid email address is send, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //fout email address
          firstName: "Anika"
          lastName: "Wante",
          emailAdress: "wantestudent.avans.nl",
          password: "P@ssw0rd123",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("Email address is invalid");
          done();
        });
    });
  });


 describe('UC-202 Overzicht van gebruikers /api/user', () => {
        // aanpassen start alle testen uc-202
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

        //nog aan te passen
        it('TC-202-1 Toon nul gebruikers', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
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