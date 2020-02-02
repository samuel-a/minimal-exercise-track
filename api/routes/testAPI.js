var typeorm = require('typeorm')
var express = require("express")
var router = express.Router()
router.get("/", function(req, res, next) {
    res.send("API is working properly.")
})
var pgp = require('pg-promise')(/* options */)


const connection = {
    host: 'localhost',
    port: 5432,
    database: 'logger_base',
    user: 'based-god',
    password: 'simp'
}

var db = pgp(connection)
db.one('SELECT $1 AS value', 123)
  .then(function (data) {
    console.log('DATA:', data.value)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })

module.exports = router
