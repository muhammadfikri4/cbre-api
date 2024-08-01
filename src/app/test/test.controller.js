const { connection } = require("../../configs/app");

function testController(req, res) {
  connection.execute({
    sqlText: "USE WAREHOUSE COMPUTE_WH;", // Set Warehouse disini
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
              return res.status(500).json({ error: "Error executing query" });
            } else {
              console.log("Query executed successfully");
              return res.status(200).json(rows);
            }
          },
        });
      }
    },
  });
}

module.exports = { testController };
