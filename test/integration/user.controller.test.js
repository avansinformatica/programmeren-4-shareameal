const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
let database = []; // is de test database

chai.should();
chai.use(chaiHttp);

// UC-101 Login
describe("Manage users", () => {
  describe("UC-201 add users /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });

    //it.only when you only want to run this test
    //it.skop if you only want to skip this test
    it("When a required input is missing, a valid error should be returned", (done) => {
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
  });
});
