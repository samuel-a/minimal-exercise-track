router = require('express').Router()
pgp = require('pg-promise')(/* options */)
require('dotenv').config()

db = pgp(process.env.DATABASE_URL)

router.get("/", function(req, res, next) {
    res.send("API is working properly.")
});

router.get("/save/:identifier/:program", function(req, res, next) {
	let program_name = req.params.identifier
	let program_string =req.params.program 
	db.none('INSERT INTO exercise (name, load) VALUES(${name}, ${program})', {name:program_name, program:program_string}).catch(function(error){console.log('SAVING ERROR: ', error)})
	res.send("Successful save.")
})

router.get("/load/:identifier", function(req, res, next) {
	program_name =  req.params.identifier
	db.query("SELECT load FROM exercise WHERE name = ${name}", {name : program_name})
	.then(function(data) {
		res.send(data)
	})
    .catch(function(e) {console.log('LOAD ERROR: ', e)})// error
})

module.exports = router;
