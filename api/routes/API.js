router = require('express').Router()
pgp = require('pg-promise')(/* options */)

db = pgp(process.env.DATABASE_URL)

router.get("/", function(req, res, next) {
    res.send("API is working properly.")
})

router.post("/save", function(req, res) {
	db.none('INSERT INTO exercise (name, load) VALUES($1, $2) ON CONFLICT (name) DO UPDATE SET load = EXCLUDED.load;', [req.body.label, req.body])
	.then(()=>{res.send("Successful save.")})
	.catch((e)=>{console.log('SAVE ERROR', e)})
})

router.get("/load/:identifier", function(req, res, next) {
	let program_name =  req.params.identifier
	db.one('SELECT load FROM exercise WHERE name = $1', [program_name])
	.then((data) => {
		res.json(data)
	})
    .catch((e) => { console.log('LOAD ERROR: ', e) })// error
})

module.exports = router;
