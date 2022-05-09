const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users /api/user', () => {
    describe('TC-201-1 add a user, all properties are required except id', () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('First name missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //First name missing
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    emailAdress: "j.doe@server.com",
                    password: "secret",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('First name must be a string');
                    done();
                })
        })
        it('Last name missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //Last name missing
                    firstName: "John",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    emailAdress: "j.doe@server.com",
                    password: "secret",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Last name must be a string');
                    done();
                })
        })
        it('Street missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //Street missing
                    firstName: "John",
                    lastName: "Doe",
                    city: "Breda",
                    emailAdress: "j.doe@server.com",
                    password: "secret",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Street must be a string');
                    done();
                })
        })
        it('City missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //City missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    emailAdress: "j.doe@server.com",
                    password: "secret",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('City must be a string');
                    done();
                })
        })
        it('Email missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //Email missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Email must be a string');
                    done();
                })
        })
        it('Password missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //Password missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    emailAdress: "j.doe@server.com",
                    phoneNumber: "06 12425475",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Password must be a string');
                    done();
                })
        })
        it('Phone number missing or invalid, return valid error', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //Phone number missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    emailAdress: "j.doe@server.com",
                    password: "secret",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('Phonenumber must be a string');
                    done();
                })
        })

        it('TC_201-5 email adress is unique in database', (done) => {
            chai.request(server)
            .post('/api/user')
            .send({
                //Phone number missing
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                emailAdress: "j.doe@server.com",
                password: "secret",
                phoneNumber: "06 12425475",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let {status, result} = res.body;
                status.should.equals(201)
            })

            chai.request(server)
            .post('/api/user')
            .send({
                //Phone number missing
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                emailAdress: "j.doe@server.com",
                password: "secret",
                phoneNumber: "06 12425475",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let {status, result} = res.body;
                status.should.equals(400)
                result.should.be.a('string').that.equals('Email is already in use');
                done();
            })
        })
    })
})