const {db} = require("./client");

//Gets all the files
const getAllFiles = function(){
  return db.any('SELECT * FROM files')
    .catch(e => {
      throw e;
    })
};

const getFileByName = function(fileName){

}

const listAllFiles = function(){

}

const saveFile = async function(fileName, content){
  console.log(fileName)
  const sql = 'INSERT INTO files(name, created, last_modified, markdown) VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $2)';
  return await db.task("save-file-task", async t => {
    const file = await t.oneOrNone('SELECT id FROM files WHERE name = $1', [fileName]);
    return file || t.one(sql, [fileName, content]);
  })
};

module.exports = {
  getAllFiles,
  saveFile
}
