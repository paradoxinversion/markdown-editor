const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../database/db");
const {pgp} = require("../database/client");
chai.use(chaiAsPromised);
const expect = chai.expect;

const createTestUser = async function createTestUser(name, password){
  const user = await db.database.one(`INSERT INTO users(name, password) VALUES ($1, $2) RETURNING *`, [name, password]);
  return user;
};

const createTestFile = async function createTestFile(name, content, user){
  const file = await db.database.one(`
    INSERT INTO
      files(owner, name, created, last_modified, markdown)
    VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3)
      RETURNING *`,
    [user.id, name, content]);

  return file;
};

describe("db.js", function(){

  beforeEach(async function(){
    await db.truncateDatabase();
  });

  after(function(){
    pgp.end();
  });

  describe("getUser(userName)",function(){
    context("when the database is empty", function(){
      it ("should return null", async function(){
        const user = await db.getUser("Jedai");
        expect(user).to.be.null;
      });
    });
    context("when the database has users", function(){
      beforeEach(async function(){
        await createTestUser("Jedai", "testpass");
      });

      it ("should not return null", async function(){
        const user = await db.getUser("Jedai");
        expect(user).to.not.be.null;
      });

      it ("should return a record with a name matching the parameter", async function(){
        const user = await db.getUser("Jedai");
        expect(user.name).to.equal("Jedai");
      });
    });
  });

  describe("addUser(userName, password)", function(){
    it ("should add a new user to the database and return it", async function(){
      const user = await db.addUser("Jedai", "testpassword");
      expect(user.name).to.equal("Jedai");
    });
    it ("should add multiple users to the database without any errors", async function(){
      const userOne = await db.addUser("Jedai", "testpassword");
      const userTwo = await db.addUser("Iadej", "testpassword");
      expect(userOne.name).to.equal("Jedai");
      expect(userTwo.name).to.equal("Iadej");
    });
    it ("should throw an error when trying to add the same user twice", async function(){
      await db.addUser("Jedai", "testpassword");
      expect(async function(){ await db.addUser("Jedai", "Password");}).to.throw;
    });
  });

  describe("saveFile(fileName, content, user)", function(){
    let userOne;
    let userTwo;
    beforeEach(async function(){
      userOne = await createTestUser("Jimbo", "testpass");
      userTwo = await createTestUser("Jedai", "testpass");
    });
    it ("should add a new file", async function(){
      const newFile = await createTestFile("Test.md", "# Test", userTwo);
      expect(newFile.name).to.equal("Test.md");
    });

    it ("should add files with different names without error", async function(){
      await createTestFile("Test1.md", "# Test", userOne);
      const newFile = await createTestFile("Test2.md", "# Test", userOne);
      expect(newFile.name).to.equal("Test2.md");
    });

    it ("should throw an error if two files with the same name are added by the same user", async function(){
      await createTestFile("Test.md", "# Test", userTwo);
      expect(async function(){await db.saveFile("Test.md", "# content", userTwo);}).to.throw;
    });
    it ("should add a file of the same name by a different user", async function(){
      await createTestFile("Test.md", "# Test", userOne);
      expect(async function(){await db.saveFile("Test.md", "# content", userTwo);}).to.not.throw();
    });
  });

  describe("getUserFiles", function(){
    let user;
    beforeEach(async function(){
      user = await createTestUser("Jedai", "testpass");
    });

    it ("Should return an empty array if user has no files", async function(){
      const files = await db.getUserFiles(user);
      expect(files).to.eql([]);
    });

    it ("Should return all user files if there are any", async function(){
      await createTestFile("Test.md", "# A Test", user);
      await createTestFile("Test2.md", "# A Test", user);
      const files = await db.getUserFiles(user);
      expect(files.length).to.equal(2);
    });
    it ("Should return only files added by the user", async function(){
      await createTestFile("Test.md", "# A Test", user);
      await createTestFile("Test2.md", "# A Test", user);
      const secondUser = await createTestUser("Jimbo", "testpass");
      await createTestFile("JimboForever.md", "# A Test", secondUser);
      const files = await db.getUserFiles(user);
      expect(files.length).to.equal(2);
    });

  });
});
