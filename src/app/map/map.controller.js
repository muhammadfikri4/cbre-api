const { connection } = require("../../configs/app");
const path = require("path");
const geojson = require("geojson");

function mapController(req, res) {
  // Default response
  let return_value = {
    numRows: 0,
    data: [],
    geojson: {},
  };

  let sql_query = "";
  // Declare URL query
  params_q = req.query.q;
  params_lat = req.query.lat;
  params_lon = req.query.lon;
  params_zoom = req.query.zoom;

  // For formula (just give NULL value or zero)
  altitude = 0;

  if (
    params_q === undefined &&
    params_lat !== undefined &&
    params_lon !== undefined &&
    params_zoom !== undefined
  ) {
    altitude = 591657550.5 / 2 ** params_zoom;
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
      params_lon +
      `, ` +
      params_lat +
      `)
				) <= ` +
      altitude +
      `
		`;
  } else if (params_q !== undefined) {
    sql_query =
      `
			SELECT
					*
				FROM
					TESTING.MAPBOX.MASTER_BUILDING
				WHERE
					LOWER(BUILDINGNAME) LIKE LOWER('%` +
      params_q +
      `%')
		`;
  } else if (
    params_q === undefined &&
    params_lat === undefined &&
    params_lon === undefined &&
    params_zoom === undefined
  ) {
    return res.status(200).json(return_value);
  }

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
}

async function mapTransportationController(req, res) {
  // Default response
  return_value = {
    numRows: 0,
    data: [],
    geojson: {},
  };

  const filename = "files\\geojson\\singapore-mrt.geojson";

  if (req.params.type !== "line") {
    filename = "files\\geojson\\singapore-mrt-label.geojson";
  }

  try {
    const fp = path.join(__dirname, filename);
    const data = await fs.readJson(fp);

    const return_value = {
      numRows: data.features.length,
      data: [],
      geojson: data,
    };

    for (const feature of data.features) {
      const properties = feature.properties || {};
      return_value.data.push({
        type: properties.type || "",
        name: properties.name || "",
        code: properties.code || "",
        color: properties.color || "",
      });
    }

    return res.json(return_value);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function mapRegionController(req, res) {
  // post_value_longitude = request.json.get("longitude");
  // post_value_latitude = request.json.get("latitude");
  // post_value_meter_radius = request.json.get("meter_radius");

  // const { longitude, latitude , meter_radius} = req.body;
  const { regionCode } = req.params;
  let return_value = {
    numRows: 0,
    data: [],
    geojson: {
      type: "FeatureCollection",
      features: [],
    },
    region: {
      REGIONCODE: "",
      REGIONNAME: "",
      POLYGON: [],
    },
  };

  let sql_query = `SELECT * FROM TESTING.MAPBOX.MASTER_BUILDING WHERE REGIONCODE = UPPER('${regionCode}')`;

  let sql_query_region = `
  SELECT
				REGIONCODE,REGIONNAME,TO_JSON(POLYGON) AS POLYGON
			FROM
				TESTING.MAPBOX.REGIONDATA
			WHERE
				REGIONCODE = UPPER('${regionCode}')
			LIMIT 1
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
              res.status(500).json({ error: "Error executing query" });
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
}

module.exports = {
  mapController,
  mapTransportationController,
  mapRegionController,
};
