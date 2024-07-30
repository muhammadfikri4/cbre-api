const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const private_key = fs.readFileSync(`files/auth/rsa_key.p8`, `UTF-8`); 
const app = express();
	  app.use(cors());

// Snowflake Configuration
snowflake.configure({
	loglevel: 'debug'
});

// Use the private key for authentication.
var connection = snowflake.createConnection({
	account: `jt05583.ap-southeast-1`,
	username: `FERDINAND`,
	authenticator: `SNOWFLAKE_JWT`,
	privateKey: private_key,
	privateKeyPass: `12345`
});

// Test connection
connection.connect( function (err, conn) {
	if(err) {
		console.log(err.message)
	}
	else {
		console.log("Snowflake Connected...")
	}
});

var statement = connection.execute({
	sqlText: `
		SELECT 1 FROM DUAL
	`,
	complete: (error, statement, rows) => {
		if(error) {
			console.log("Error query");
			return {}
		}
		else {
			console.log("OK");
			return rows[0];
		}
	}
});

// Routing - /
app.get('/', function(req, res){
	res.json({
		message: "Snowflake REST API CBRE (NodeJS)"
	}, 200);
});


// Routing - /test
app.get('/test', function (req, res) {
	var statement = connection.execute({
		sqlText: `
			SELECT * FROM TESTING.MAPBOX.MASTER_BUILDING LIMIT 10
		`,
		complete: (error, statement, rows) => {
			if (error) {
				console.log("Error query");
				res.status(500).json({ error: "Error executing query" });
			} else {
				console.log("Query executed successfully");
				res.status(200).json(rows);
			}
		}
	});
});

app.listen(3500);