const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const geojson = require("geojson");
const { snowflakeConfig } = require("./configs/app");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Content-Type",
      "Date",
      "X-Api-Version",
    ],
    credentials: true,
    preflightContinue: false,
  })
);
app.use(express.urlencoded({ extended: true }));

snowflakeConfig();

app.use(routes);

app.listen(3000);
