const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
let database = []; // is de test database //

chai.should();
chai.use(chaiHttp);


// TODO: UC-101 Login

// UC-201 add users
describe("Manage users", () => {
  describe("UC-201 add users /api/user", () => {
   beforeEach((done) => {
        database = [];
        done();
      });

    //it.only when you only want to run this test
    //it.skip if you only want to skip this test

    // CHECK
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

    // CHECK
    it("UC-201-2 When a non-valid email address is send, a valid error should be returned", (done) => {
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
          phoneNumber: "0612345678"
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
    it("UC-201-3 When a invalid password is provided, a valid error should be returned", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("Password is invalid");
              done();
            });
          });

//TODO
    it("UC-201-4 When user already exists, a valid error should be returned", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("User already exists");
              done();
            });
          });


//TODO
    it("UC-201-5 User successfully registered, return 200 response", (done) => {
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
              phoneNumber: "0612345678"
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




//**************
describe("UC-202 Overview users /api/user", () => {
   beforeEach((done) => {
        database = [];
        done();
      });

//TODO
    it("UC-202-1 Give 0 users, return 200 response", (done) => {
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

//TODO
    it("UC-202-2 Give 2 users, return 200 response", (done) => {
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
          phoneNumber: "0612345678"
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

//TODO
    it("UC-202-3 Give users with non existing name, return 200 response", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("Password is invalid");
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("User already exists");
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("User already exists");
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
              phoneNumber: "0612345678"
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
//**************

//**************
//TODO 203 nog niet voor inlevermoment 2
//describe("UC-203 Request userprofile /api/user/??profile or :userId", () => {
//   beforeEach((done) => {
//        database = [];
//        done();
//      });
//
////TODO (nog niet voor inlevermoment 2)
//    it("UC-203-1 Invalid token, return 404 response", (done) => {
//      chai
//        .request(server)
//        .post("/api/user")
//        .send({
//          //first name ontbreekt
//          lastName: "Wante",
//          emailAdress: "wante@student.avans.nl",
//          password: "P@ssw0rd123",
//        })
//        .end((err, res) => {
//          res.should.be.an("object");
//          let { status, result } = res.body;
//          status.should.equals(200);
//          result.should.be
//            .a("string")
//            .that.equals("First Name must be a string");
//          done();
//        });
//    });
//
////TODO (nog niet voor inlevermoment 2)
//    it("UC-203-2 Valid token and user exists, return 200 response", (done) => {
//      chai
//        .request(server)
//        .post("/api/user")
//        .send({
//          //fout email address
//          firstName: "Anika",
//          lastName: "Wante",
//          street: "Academiesingel 17",
//          city: "Breda",
//          isActive: true,
//          emailAdress: "wantestudent.avans.nl",
//          password: "P@ssw0rd123",
//          phoneNumber: "0612345678"
//        })
//        .end((err, res) => {
//          res.should.be.an("object");
//          let { status, result } = res.body;
//          status.should.equals(400);
//          result.should.be
//            .a("string")
//            .that.equals("Email Address must contain an @ symbol and a dot");
//          done();
//        });
//    });
//  });
//**************

//**************
describe("UC-204 User details /api/user/:userId", () => {
   beforeEach((done) => {
        database = [];
        done();
      });

//TODO (nog niet voor inlevermoment 2)
//    it("UC-204-1 Invalid token", (done) => {
//      chai
//        .request(server)
//        .post("/api/user")
//        .send({
//          //first name ontbreekt
//          lastName: "Wante",
//          emailAdress: "wante@student.avans.nl",
//          password: "P@ssw0rd123",
//        })
//        .end((err, res) => {
//          res.should.be.an("object");
//          let { status, result } = res.body;
//          status.should.equals(200);
//          result.should.be
//            .a("string")
//            .that.equals("First Name must be a string");
//          done();
//        });
//    });

//TODO
    it("UC-204-2 user-id doesn't exist, return 404 response", (done) => {
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
          phoneNumber: "0612345678"
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

//TODO
    it("UC-204-3 user-id exists, return 200 response", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("Password is invalid");
              done();
            });
          });
  });
//**************

//**************
describe("UC-205 Change user /api/user/:userId", () => {
   beforeEach((done) => {
        database = [];
        done();
      });

//TODO
    it("UC-205-1 A required field is missing, return 400 response", (done) => {
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

//TODO
    it("UC-205-2 invalid postal code, return 400 response", (done) => {
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
          phoneNumber: "0612345678"
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("Password is invalid");
              done();
            });
          });

//TODO
    it("UC-205-4 User doesn't exist, return 400 response", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("User already exists");
              done();
            });
          });


//TODO (niet voor inlevermoment 2)
//    it("UC-205-5 Not logged in, return 401 response", (done) => {
//          chai
//            .request(server)
//            .post("/api/user")
//            .send({
//              //
//              firstName: "Anika",
//              lastName: "Wante",
//              street: "Academiesingel 17",
//              city: "Breda",
//              isActive: true,
//              emailAdress: "test@student.avans.nl",
//              password: "P@ssw0rd123",
//              phoneNumber: "0612345678"
//            })
//            .end((err, res) => {
//              res.should.be.an("object");
//              let { status, result } = res.body;
//              status.should.equals(400);
//              result.should.be
//                .a("string")
//                .that.equals("User already exists");
//              done();
//            });
//          });

//TODO
    it("UC-205-6 User is successfully changed, return 200 response", (done) => {
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
              phoneNumber: "0612345678"
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
//**************

//**************
describe("UC-206 Delete user /api/user/:userId", () => {
   beforeEach((done) => {
        database = [];
        done();
      });

//TODO
    it("UC-206-1 User doesn't exist, return 404 response", (done) => {
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

//TODO (niet voor inlevermoment 2)
//    it("UC-206-2 Not logged in, return 401 response", (done) => {
//      chai
//        .request(server)
//        .post("/api/user")
//        .send({
//          //fout email address
//          firstName: "Anika",
//          lastName: "Wante",
//          street: "Academiesingel 17",
//          city: "Breda",
//          isActive: true,
//          emailAdress: "wantestudent.avans.nl",
//          password: "P@ssw0rd123",
//          phoneNumber: "0612345678"
//        })
//        .end((err, res) => {
//          res.should.be.an("object");
//          let { status, result } = res.body;
//          status.should.equals(400);
//          result.should.be
//            .a("string")
//            .that.equals("Email Address must contain an @ symbol and a dot");
//          done();
//        });
//    });

//TODO (niet voor inlevermoment 2)
//    it("UC-206-3 Actor is no owner, return 401 response", (done) => {
//          chai
//            .request(server)
//            .post("/api/user")
//            .send({
//              //
//              firstName: "Anika",
//              lastName: "Wante",
//              street: "Academiesingel 17",
//              city: "Breda",
//              isActive: true,
//              emailAdress: "test@student.avans.nl",
//              password: "password",
//              phoneNumber: "0612345678"
//            })
//            .end((err, res) => {
//              res.should.be.an("object");
//              let { status, result } = res.body;
//              status.should.equals(400);
//              result.should.be
//                .a("string")
//                .that.equals("Password is invalid");
//              done();
//            });
//          });

//TODO
    it("UC-206-4 User successfully deleted, return 200 response", (done) => {
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
              phoneNumber: "0612345678"
            })
            .end((err, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(400);
              result.should.be
                .a("string")
                .that.equals("User already exists");
              done();
            });
          });
    });
//**************



















// describe('UC-202 Overzicht van gebruikers /api/user', () => {
//        // aanpassen start alle testen uc-202
//        beforeEach((done) => {
//            console.log('beforeEach called')
//            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
//            dbconnection.getConnection(function (err, connection) {
//                if (err) throw err // not connected!
//                connection.query(
//                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
//                    function (error, results, fields) {
//                        // When done with the connection, release it.
//                        connection.release()
//                        // Handle error after the release.
//                        if (error) throw error
//                        // Let op dat je done() pas aanroept als de query callback eindigt!
//                        console.log('beforeEach done')
//                        done()
//                    }
//                )
//            })
//        })
//
//        //nog aan te passen
//        it('TC-202-1 Toon nul gebruikers', (done) => {
//            chai.request(server)
//                .get('/api/movie')
//                .end((err, res) => {
//                    assert.ifError(err)
//
//                    res.should.have.status(200)
//                    res.should.be.an('object')
//
//                    res.body.should.be
//                        .an('object')
//                        .that.has.all.keys('results', 'statusCode')
//
//                    let { statusCode, results } = res.body
//                    statusCode.should.be.an('number')
//                    results.should.be.an('array').that.has.length(2)
//                    results[0].name.should.equal('Meal A')
//                    results[0].id.should.equal(1)
//                    done()
//                })
//        })
//        // En hier komen meer testcases
//    })
})












