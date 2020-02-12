router = require('express').Router()
pgp = require('pg-promise')(/* options */)
require('dotenv').config()

db = pgp(process.env.DATABASE_URL)

router.get("/", function(req, res, next) {
    res.send("API is working properly.")
})

router.post("/save", function(req, res) {
	let program_name = req.body.identifier
	let program_string =req.body.load
	db.none('INSERT INTO exercise (name, load) VALUES(${name}, ${program})', {name:program_name, program:program_string})
	.then(()=>{res.send("Successful save.")})
	.catch((e)=>{console.log('SAVE ERROR', e)})
})

router.get("/load/:identifier", function(req, res, next) {
	let program_name =  req.params.identifier
	console.log(program_name)
	db.any('SELECT load FROM exercise WHERE name = $1', [program_name])
	.then((data) => {
	res.json({status: 'found', program: data})
	})
    .catch((e) => {console.log('LOAD ERROR: ', e)})// error
})

module.exports = router;
