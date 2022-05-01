const mysql = require('mysql2')
require('dotenv').config()

const dbConfig = {
    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

console.log(dbConfig)

const pool = mysql.createPool(dbConfig)

pool.on('connection', function (connection) {
    console.log(`Connected to database '${connection.config.database}'`)
})

pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId)
})

module.exports = pool
