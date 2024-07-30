const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
const fs = require('fs-extra');
const path = require('path'); 
const geojson = require('geojson');
const private_key = fs.readFileSync(`files/auth/rsa_key.p8`, `UTF-8`); 
const app = express();
	  app.use(cors());
	  app.use(express.json());

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

// Routing - /
app.get('/', function(req, res){
	res.json({
		message: "Snowflake REST API CBRE (NodeJS)"
	}, 200);
});


// Routing - /test
app.get('/test', function (req, res) {
	connection.execute({
		sqlText: 'USE WAREHOUSE COMPUTE_WH;', // Set Warehouse disini
		complete: (error, statement, rows) => {
			if (error) {
				res.status(500).json({ error: "Warehouse error." });
			} else {
				connection.execute({
					sqlText: `
						SELECT * FROM TESTING.MAPBOX.MASTER_BUILDING LIMIT 10;
					`,
					complete: (error, statement, rows) => {
						if (error) {
							console.log("Error executing query");
							res.status(500).json({ error: "Error executing query" });
						} else {
							console.log("Query executed successfully");
							res.status(200).json(rows);
						}
					}
				});
			}
		}
	});
});

// Routing - /map/radius
app.get('/map', function (req, res) {
	// Default response
	return_value = {
		"numRows": 0,
		"data": [],
		"geojson": {}
	}

	// Declare URL query
	params_q = req.query.q;
	params_lat = req.query.lat;
	params_lon = req.query.lon;
	params_zoom = req.query.zoom;
	
	// For formula (just give NULL value or zero)
	altitude = 0;

	if(params_q === undefined && params_lat !== undefined && params_lon !== undefined && params_zoom !== undefined ) {
		altitude = 591657550.5 / (2 ** params_zoom);
		sql_query = `
			SELECT
				*
			FROM
				TESTING.MAPBOX.MASTER_BUILDING
			WHERE
				ST_DISTANCE(
					ST_POINT(LONGITUDE, LATITUDE),
					ST_POINT(` + params_lon + `, ` + params_lat + `)
				) <= ` + altitude + `
		`;
	}
	else if(params_q !== undefined) {
		sql_query = `
			SELECT
					*
				FROM
					TESTING.MAPBOX.MASTER_BUILDING
				WHERE
					LOWER(BUILDINGNAME) LIKE LOWER('%` + params_q + `%')
		`;
	}
	else if(params_q === undefined && params_lat === undefined && params_lon === undefined && params_zoom === undefined ) {
		res.status(200).json(return_value);
	}

	connection.execute({
		sqlText: 'USE WAREHOUSE COMPUTE_WH;', // Set Warehouse disini
		complete: (error, statement, rows) => {
			if (error) {
				res.status(500).json({ error: "Warehouse error." });
			} else {
				connection.execute({
					sqlText: sql_query,
					complete: (error, statement, rows) => {
						if (error) {
							console.log(error)
							res.status(500).json({ error: "Error executing query" });
						} else {
							console.log("Query executed successfully");
							return_value.numRows = rows.length;
							return_value.data = rows;
							return_value.geojson = geojson.parse(rows, {Point: ['LATITUDE', 'LONGITUDE'], exclude: ['LATITUDE', 'LONGITUDE']});
							res.status(200).json(return_value);
						}
					}
				});
			}
		}
	});

});


// Routing - /map-radius-circle
app.post('/map-radius-circle', function (req, res) {

	// Default response
	return_value = {
		"numRows": 0,
		"data": [],
		"geojson": {}
	}

	if(req.body.longitude !== undefined && req.body.latitude !== undefined && req.body.meter_radius !== undefined) {
		sql_query = `
			SELECT
				*
			FROM
				TESTING.MAPBOX.MASTER_BUILDING
			WHERE
				ST_DISTANCE(
					ST_POINT(LONGITUDE, LATITUDE),
					ST_POINT(` + req.body.longitude + `, ` + req.body.latitude + `)
				) <= ` + req.body.meter_radius + `
		`;
		connection.execute({
			sqlText: 'USE WAREHOUSE COMPUTE_WH;', // Set Warehouse disini
			complete: (error, statement, rows) => {
				if (error) {
					res.status(500).json({ error: "Warehouse error." });
				} else {
					connection.execute({
						sqlText: sql_query,
						complete: (error, statement, rows) => {
							if (error) {
								console.log(error)
								res.status(500).json({ error: "Error executing query" });
							} else {
								console.log("Query executed successfully");
								return_value.numRows = rows.length;
								return_value.data = rows;
								return_value.geojson = geojson.parse(rows, {Point: ['LATITUDE', 'LONGITUDE'], exclude: ['LATITUDE', 'LONGITUDE']});
								res.status(200).json(return_value);
							}
						}
					});
				}
			}
		});
	}
	else {
		res.status(403).json(return_value);
	}

});

// Routing - /map-transportation/:type
app.get('/map-transportation/:type', async (req, res) => {
    const { type } = req.params;
    let filename = 'files\\geojson\\singapore-mrt.geojson';
    
    if (type !== 'line') {
        filename = 'files\\geojson\\singapore-mrt-label.geojson';
    }

    try {
        const fp = path.join(__dirname, filename);
        const data = await fs.readJson(fp);

        const returnValue = {
            numRows: data.features.length,
            data: [],
            geojson: data
        };

        for (const feature of data.features) {
            const properties = feature.properties || {};
            returnValue.data.push({
                type: properties.type || "",
                name: properties.name || "",
                code: properties.code || "",
                color: properties.color || ""
            });
        }

        res.json(returnValue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3500);