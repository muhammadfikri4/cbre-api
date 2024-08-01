function rootController(req, res) {
  return res.json(
    {
      message: "Snowflake REST API CBRE (NodeJS)",
    },
    200
  );
}

module.exports = { rootController };
