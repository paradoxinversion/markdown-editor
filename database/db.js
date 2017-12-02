const bcrypt = require("bcrypt");
const {db} = require("./client");

/**
 * This function checks a user object and returns its ID if there is one-- 0 otherwise.
 * @param {Object} user the user object to check for an id
 * @returns {Number} The user id if it exists, 0 if one cannot be found
 */
const getUserId = function getUserId(user){
  if (!user){
    console.log('returning 0')
    return 0;
  } else{
    console.log("returning id", user.id)
    return user.id;
  }
};

/*
  User Functions
*/

/**
 * This function checks the database for a for a user and returns them or null.
 * @async
 * @param {string} userName a username to check the database for.
 * @returns {Object} The user record if it exists, null if no user is found with userName
 */
const getUser = async function getUser(userName){
  const user = await db.oneOrNone('SELECT * FROM users WHERE name = $1', [userName]);
  return user;
};

/**
 * This function checks the database for a for a user and returns them or null.
 * @async
 * @param {string} userName a username to check the database for.
 * @returns {Object} The user record if it exists, null if no user is found with userName
 */
const getUserById = async function getUserById(userId){
  const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
  return user;
};

/**
 * This function adds a new user to the database.
 * @async
 * @param {string} plainText a plaintext password.
 * @returns {string} that password, encrypted.
 */
const addUser = async function addUser(userName, password){
  const sql = 'INSERT INTO users(name, password) VALUES ($1, $2) RETURNING *';
  return await db.task("add-user-task", async t => {
    try {
      const user = await t.oneOrNone('SELECT id FROM users WHERE name = $1', [userName]);
      if (user){
        const userExistsError = new Error("User Already Exists");
        userExistsError.code = 409;
        throw userExistsError;
      }else{
        return user || t.one(sql, [userName, await saltPassword(password)]);
      }
    } catch(e){
      throw e;
    }
  });
};

/**
 * This function returns all files owned by the supplied user
 * @async
 * @param {Object} user The user who's files to return
 * @returns {Array} an array of user files or an empty array
 */
const getUserFiles = async function getUserFiles(userId){
  const files = await db.any("SELECT * FROM files WHERE owner = $1", [userId]);
  return files;
};

const getFileById = async function getFileByid(fileId, userId){
  const file = await db.oneOrNone("SELECT * FROM files WHERE id = $1", [fileId]);
  if (file){
    await db.none('UPDATE users SET last_edited =$1 WHERE id = $2', [file.id, userId]);
  }
  return file;
};

/**
 * Saves a single file to the database.
 * @async
 * @param {string} fileName the name of the file, should be unique.
 * @param {string} content the content of the markdown file.
 * @returns {string} that password, encrypted.
 */
const saveFile = async function saveFile(fileName, content, user){
  const sql = 'INSERT INTO files(owner, name, created, last_modified, markdown) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3) RETURNING *';
  return await db.task("save-file-task", async t => {
    try {
      const file = await t.oneOrNone('SELECT * FROM files WHERE name = $1 AND owner = $2', [fileName, user.id]);
      if (file){
        try{
          const updatedFile = await t.one('UPDATE files SET markdown= $1, name= $2 WHERE id= $3 RETURNING *', [content, fileName, file.id]);
          await t.none('UPDATE users SET last_edited =$1 WHERE id = $2', [file.id, user.id]);
          return updatedFile;
        }catch (e){
          console.log(e);
        }

      } else{
        try{
          const newFile = await t.one(sql, [user.id, fileName, content]);
          await t.none('UPDATE users SET last_edited =$1 WHERE id = $2', [newFile.id, user.id]);
          return newFile;
        } catch (e){
          console.log(e);
        }

      }
    } catch (e){
      throw e;
    }
  });
};
const deleteFile = async function deleteFile(fileId){
  const sql = "DELETE FROM files WHERE id = $1 RETURNING *";
  return await db.oneOrNone(sql, [fileId]);
};
/**
 * This function returns an encrypted password from a plaintext one.
 * @async
 * @param {string} plainText a plaintext password.
 * @returns {string} that password, encrypted.
 */
const saltPassword = async function saltPassword(plainText){
  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(plainText, saltRounds);
  return encryptedPassword;
};

/**
 * Truncates all tables in the database.
 * @async
 */
const truncateDatabase = async function truncateDatabase(){

  await db.none(`TRUNCATE users, files RESTART IDENTITY CASCADE`);
  await addUser("Public", "INSECURE_IMPLEMENTATION");
};

const checkPassword = async function checkPassword(user, password){
  const result = await bcrypt.compare(password, user.password);
  return result;
};

module.exports = {
  database: db,
  saveFile,
  saltPassword,
  truncateDatabase,
  getUser,
  addUser,
  getUserFiles,
  getFileById,
  checkPassword,
  getUserById,
  deleteFile
};
