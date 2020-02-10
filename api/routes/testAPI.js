var express = require('express')
var router = express.Router()
router.get("/", function(req, res, next) {
    res.send("API is working properly.")
})

var pgp = require('pg-promise')(/* options */)

require('dotenv').config()

var db = pgp(process.env.DATABASE_URL)
db.one('SELECT $1 AS value', 123)
  .then(function (data) {
    console.log('DATA:', data.value)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })

module.exports = router
