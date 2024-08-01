const { Router } = require("express");
const { connection } = require("../configs/app");
const fs = require("fs-extra");
const path = require("path");
const geojson = require("geojson");
const { rootController } = require("../app/root/root.controller");
const { testController } = require("../app/test/test.controller");
const { radiusController } = require("../app/radius/radius.controller");
const {
  mapController,
  mapTransportationController,
  mapRegionController,
} = require("../app/map/map.controller");

const router = Router();

// Routing - /
router.get("/", rootController);

// Routing - /test
router.get("/test", testController);

// Routing - /map/radius
router.get("/map", mapController);

// Routing - /map-radius-circle
router.post("/map-radius-circle", radiusController);

// Routing - /map-transportation/:type
router.get("/map-transportation/:type", mapTransportationController);

router.get("/map-region/:regionCode", mapRegionController);

module.exports = router;
