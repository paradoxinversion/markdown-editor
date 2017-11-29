const db = require("../database/db");

module.exports = {
  getAllFiles: db.getAllFiles,
  saveFile: db.saveFile,
  getUser: db.getUser,
  addUser: db.addUser,
  getUserFiles: db.getUserFiles,
  checkPassword: db.checkPassword
};
