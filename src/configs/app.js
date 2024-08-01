const snowflake = require("snowflake-sdk");
const fs = require("fs-extra");
const path = require("path");

const private_key_path = path.resolve(__dirname, "../../files/auth/rsa_key.p8");
const private_key = fs.readFileSync(private_key_path, "UTF-8");

// Use the private key for authentication.
var connection = snowflake.createConnection({
  account: `jt05583.ap-southeast-1`,
  username: `FERDINAND`,
  authenticator: `SNOWFLAKE_JWT`,
  privateKey: private_key,
  privateKeyPass: `12345`,
});

function snowflakeConfig() {
  // Snowflake Configuration
  snowflake.configure({
    loglevel: "debug",
  });

  // Test connection
  connection.connect(function (err, conn) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Snowflake Connected...");
    }
  });
}

module.exports = {
  snowflakeConfig,
  connection,
};
