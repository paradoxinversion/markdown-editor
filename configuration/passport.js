const LocalStrategy = require("passport-local").Strategy;
const db = require("../controllers/db.js");

module.exports = function(passport){

  /*
    These functions handle serializing and deserializing the user
  */

  passport.serializeUser(function(user, done){
    console.log("serializing")

    done(null, user.id);
  });


  passport.deserializeUser(function(id, done){
    console.log("deserializing")
    db.getUserById(id)
      .then(user => {
        done(null, user);
      })
      .catch(error => {
        done(error, false);
      });
  });

  /*
    Here we configure two different local strategies for passport--
    One handles signing up, one handles signing in.
  */

  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: "sign-up-username",
      passwordField: "sign-up-password"
    },
    function(username, password, done){
      return db.addUser(username, password)
        .then(user => {
          if (user){
            return done(null, user);
          }
        })
        .catch(error => {
          return done(error, false);
        });
    }
  ));

  passport.use('local-login',new LocalStrategy(
    {
      usernameField: "sign-in-username",
      passwordField: "sign-in-password"
    },
    function(username, password, done){
      return db.getUser(username)
        .then(user => {
          if (!user){
            return done(null, false);
          } else{
            return db.checkPassword(user, password)
              .then(isGoodPassword => {
                if (!isGoodPassword){
                  console.log("success");
                  return done(null, false);
                }
                return done(null, user);
              })
              .catch(error => {
                return done(error, false);
              });
          }
        })
        .catch(error => {
          return done(error, false);
        });
    }
  ));

};
