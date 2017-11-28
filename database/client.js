const pgp = require("pg-promise")();

const cn = {
  host: 'localhost',
  port: 5432,
  database: 'markdown_editor'
};

const db = pgp(cn);

module.exports = {
  db
};
