const path = require("path");

module.exports = (()=>{
  let config = {};

  /**
   * Returns Node's current environment variable.
   * @returns {string} Node's environment variable
   */
  const getEnv = () =>{
    return process.env.NODE_ENV;
  };

  /**
   * Creates a configuration object
   * @returns {Object} An object with app configuration
   */
  const makeConfig = () =>{
    if (getEnv() === 'development'){
      require('dotenv').config({path:path.join(__dirname, "../.env")});
    }

    config = {
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      }
    };
    return config;
  };

  const getConfig = () =>{
    return config;
  };

  makeConfig();
  return {
    getEnv,
    getConfig
  };
})();
