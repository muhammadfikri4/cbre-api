const { connection } = require("../../configs/app");
const geojson = require("geojson");

function radiusController(req, res) {
  // Default response
  let return_value = {
    numRows: 0,
    data: [],
    geojson: {},
  };

  let sql_query = "";

  if (
    req.body.longitude !== undefined &&
    req.body.latitude !== undefined &&
    req.body.meter_radius !== undefined
  ) {
    sql_query =
      `
			SELECT
				*
			FROM
				TESTING.MAPBOX.MASTER_BUILDING
			WHERE
				ST_DISTANCE(
					ST_POINT(LONGITUDE, LATITUDE),
					ST_POINT(` +
      req.body.longitude +
      `, ` +
      req.body.latitude +
      `)
				) <= ` +
      req.body.meter_radius +
      `
		`;
    connection.execute({
      sqlText: "USE WAREHOUSE COMPUTE_WH;", // Set Warehouse disini
      complete: (error, statement, rows) => {
        if (error) {
          return res.status(500).json({ error: "Warehouse error." });
        } else {
          connection.execute({
            sqlText: sql_query,
            complete: (error, statement, rows) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ error: "Error executing query" });
              } else {
                console.log("Query executed successfully");
                return_value.numRows = rows.length;
                return_value.data = rows;
                return_value.geojson = geojson.parse(rows, {
                  Point: ["LATITUDE", "LONGITUDE"],
                  exclude: ["LATITUDE", "LONGITUDE"],
                });
                return res.status(200).json(return_value);
              }
            },
          });
        }
      },
    });
  } else {
    res.status(403).json(return_value);
  }
}

module.exports = { radiusController };
