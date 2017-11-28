const db = require("../database/db");

module.exports = {
  getAllFiles: db.getAllFiles,
  saveFile: db.saveFile
};
