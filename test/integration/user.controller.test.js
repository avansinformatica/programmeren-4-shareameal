process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";
process.env.LOGLEVEL = "debug"; //warn

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../src/database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/config/config");

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-201 add users
describe("Manage users", () => {
  describe("UC-201 add users /api/user", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) next(err); // not connected!

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(err);
          // done() aanroepen nu je de query callback eindigt.
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    //it.only when you only want to run this test
    //it.skip if you only want to skip this test

    // DONE
    it("UC-201-1 When a required input is missing, a valid error should be returned 400", (done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
      chai
        .request(server)
        .get("/api/movie")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an("object");

          res.body.should.be
            .an("object")
            .that.has.all.keys("results", "statusCode");

          const { statusCode, results } = res.body;
          statusCode.should.be.an("number");
          results.should.be.an("array").that.has.length(2);
          results[0].name.should.equal("Meal A");
          results[0].id.should.equal(1);
          done();
        });
    });

    // chai
    //   .request(server)
    //   .post("/api/user")
    //   .send({
    //     //first name ontbreekt
    //     lastName: "Wante",
    //     emailAdress: "wante@student.avans.nl",
    //     password: "P@ssw0rd123",
    //   })
    //   .end((err, res) => {
    //     res.should.be.an("object");
    //     let { status, result } = res.body;
    //     status.should.equals(400);
    //     result.should.be
    //       .a("string")
    //       .that.equals("First Name must be a string");
    //     done();
    //   });

    // DONE
    it("UC-201-2 When a non-valid email address is send, a valid error should be returned 400", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //fout email address
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "wantestudent.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("Email Address must contain an @ symbol and a dot");
          done();
        });
    });

    //TODO: WAAR MOET HET PASSWORD AAN VOLDOEN? NU ALLEEN FOUT ALS PW: "password" IS
    // DONE
    it("UC-201-3 When a invalid password is provided, a valid error should be returned 400", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "password",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Password is invalid");
          done();
        });
    });

    // DONE
    it("UC-201-4 When user already exists, a valid error should be returned 409", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("User already exists");
          done();
        });
    });

    // DONE
    it("UC-201-5 User successfully registered, return 201 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          done();
        });
    });
  });

  describe("UC-202 Overview users /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    // DONE
    it("UC-202-1 Give 0 users, return 200 response", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("array");
          result.length.should.be.eql(0);
          done();
        });
    });

    //TODO ?? only one user?
    it("UC-202-2 Give 2 users, return 200 response", (done) => {
      let user = new User({
        firstName: "Pietje",
        lastName: "Precies",
        street: "Straatnaam 3",
        city: "Breda",
        isActive: true,
        emailAdress: "pietje@precies.nl",
        password: "PietjesPassword123",
        phoneNumber: "0612233445",
      });
      user.save((err, user) => {
        chai
          .request(server)
          .get("/api/user")
          .end((err, res) => {
            res.should.be.an("object");
            let { status, result } = res.body;
            status.should.equals(200);
            result.should.be.a("array");
            result.length.should.be.eql(2);
            done();
          });
      });
    });

    //TODO
    it("UC-202-3 Give users with non existing name, return 200 response", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "password",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Password is invalid");
          done();
        });
    });

    //TODO
    it("UC-202-4 Give users for 'isActive' = false, return 200 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("User already exists");
          done();
        });
    });

    //TODO
    it("UC-202-5 Give users for 'isActive' = true, return 200 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("User already exists");
          done();
        });
    });

    //TODO
    it("UC-202-6 Give users with existing name, return 200 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          //              result.should.be
          //                .a("string")
          //                .that.equals("User is successfully registered");
          done();
        });
    });
  });

  // //TODO 203 (nog niet voor inlevermoment 2 want endpoint nog niet gerealiseerd)
  describe("UC-203 * Request userprofile /api/user/??profile or :userId", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    // //TODO (nog niet voor inlevermoment 2 want endpoint nog niet gerealiseerd)
    it("UC-203-1 Invalid token, return 404 response", (done) => {
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
          status.should.equals(200);
          result.should.be
            .a("string")
            .that.equals("First Name must be a string");
          done();
        });
    });

    // //TODO (nog niet voor inlevermoment 2 want endpoint nog niet gerealiseerd)
    it("UC-203-2 Valid token and user exists, return 200 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //fout email address
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "wantestudent.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("Email Address must contain an @ symbol and a dot");
          done();
        });
    });
  });

  describe("UC-204 * User details /api/user/:userId", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    //TODO (nog niet voor inlevermoment 2)
    it("UC-204-1 Invalid token 401 response", (done) => {
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
          status.should.equals(200);
          result.should.be
            .a("string")
            .that.equals("First Name must be a string");
          done();
        });
    });

    // DONE
    it("UC-204-2 user-id doesn't exist, return 404 response", (done) => {
      chai
        .request(server)
        .get("/api/user/3")
        .end((err, res) => {
          let { status, result } = res.body;
          res.should.have.status(404);
          result.should.be.a("string").that.equals("User with ID 3 not found");
          done();
        });
    });

    // DONE
    it("UC-204-3 user-id exists, return 200 response", (done) => {
      chai
        .request(server)
        .get("/api/user/1")
        .end((err, res) => {
          let { status, result } = res.body;
          res.should.have.status(200);
          result.should.be.a("array").that.eql([
            {
              id: 1,
              firstName: "Red",
              lastName: "Bull",
              street: "Straatje",
              city: "Zandvoort",
              isActive: true,
              emailAdress: "red@bull.nl",
              password: "RedBull=123",
              phoneNumber: "0698876554",
            },
          ]);
          done();
        });
    });
  });

  describe("UC-205 * Change user /api/user/:userId", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) next(err); // not connected!

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(err);
          // done() aanroepen nu je de query callback eindigt.
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    //DONE FINAL
    it("UC-205-1 A required field is missing, return 400 response", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
        .send({
          lastName: "Bull",
          street: "Straatje",
          city: "Zandvoort",
          isActive: true,
          emailAdress: "red@bull.nl",
          password: "RedBull=123",
          phoneNumber: "0698876554",
        })
        .end((err, res) => {
          logger.debug(res.status);
          res.should.be.an("object");
          let { status, result } = res.body;
          logger.debug("res.body: ");
          logger.debug(res.body);
          logger.debug("res.statusCode: ");
          logger.debug(res.statusCode);
          logger.debug("res.result: ");
          logger.debug(res.body.err.result);
          res.statusCode.should.eql(400);
          res.body.err.result.should.be
            .a("string")
            .that.equals("First Name must be a string");
          done();
        });
    });

    //TODO
    it("UC-205-3 Invalid phone number, return 400 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "password",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Password is invalid");
          done();
        });
    });

    // DONE
    it("UC-205-4 User doesn't exist, return 400 response", (done) => {
      chai
        .request(server)
        .put("/api/user/3")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("User with ID 3 not found");
          done();
        });
    });

    //TODO
    it("UC-205-5 Not logged in, return 401 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("User already exists");
          done();
        });
    });

    // DONE
    it("UC-205-6 User is successfully changed, return 200 response", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
        .send({
          id: 1,
          firstName: "Green",
          lastName: "Bull",
          street: "Straatje",
          city: "Zandvoort",
          isActive: true,
          emailAdress: "red@bull.nl",
          password: "RedBull=123",
          phoneNumber: "0698876554",
        })
        .end((err, res) => {
          let { status, result } = res.body;
          res.should.have.status(200);
          result.should.be.a("array").that.eql([
            {
              id: 1,
              firstName: "Green",
              lastName: "Bull",
              street: "Straatje",
              city: "Zandvoort",
              isActive: true,
              emailAdress: "red@bull.nl",
              password: "RedBull=123",
              phoneNumber: "0698876554",
            },
            {
              id: 2,
              firstName: "Pietje",
              lastName: "Precies",
              street: "Laan",
              city: "Amsterdam",
              isActive: true,
              emailAdress: "pietje@precies.nl",
              password: "PietjePrecies=123",
              phoneNumber: "0612345678",
            },
          ]);
          done();
        });
    });
  });

  describe("UC-206 ** Delete user /api/user/:userId", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    // DONE
    it("UC-206-1 User doesn't exist, return 400 response", (done) => {
      chai
        .request(server)
        .delete("/api/user/3")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(404);
          result.should.be.a("string").that.equals("User with ID 3 not found");
          done();
        });
    });

    //TODO (niet voor inlevermoment 2)
    it("UC-206-2 Not logged in, return 401 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //fout email address
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "wantestudent.avans.nl",
          password: "P@ssw0rd123",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("Email Address must contain an @ symbol and a dot");
          done();
        });
    });

    //TODO (niet voor inlevermoment 2)
    it("UC-206-3 Actor is no owner, return 403 response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "Anika",
          lastName: "Wante",
          street: "Academiesingel 17",
          city: "Breda",
          isActive: true,
          emailAdress: "test@student.avans.nl",
          password: "password",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Password is invalid");
          done();
        });
    });

    // DONE
    it("UC-206-4 User successfully deleted, return 200 response", (done) => {
      chai
        .request(server)
        .delete("/api/user/2")
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("array").that.eql([
            {
              id: 1,
              firstName: "Red",
              lastName: "Bull",
              street: "Straatje",
              city: "Zandvoort",
              isActive: true,
              emailAdress: "red@bull.nl",
              password: "RedBull=123",
              phoneNumber: "0698876554",
            },
          ]);
          done();
        });
    });
  });
});
