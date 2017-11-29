const pgp = require("pg-promise")();
const c = require("../configuration/config");
const config = c.getConfig();
const connectionConfiguration = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database
};

const db = pgp(connectionConfiguration);

module.exports = {
  db,
  pgp
};
