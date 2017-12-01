
const passport = require("passport");
const express = require("express");
const db = require("../controllers/db");
const router = express.Router();

router.get('/', (req, res) => {
  console.log("SESSION:", req.session);
  // console.log(req.cookies);
  if (req.query.userId){
    db.getUserFiles(req.query.userId)
      .then((files) =>{
        return res.json(files);
      })
      .catch(e =>{
        throw e;
      });
  }else{
    return res.render("index");
  }
});

router.get('/file/:fileId', (req, res) => {
  console.log("SESSION:", req.session.passport.user);
  db.getFileById(req.params.fileId, req.session.passport.user)
    .then((file) =>{
      res.cookie('last_file', req.params.fileId);
      return res.json(file);
    })
    .catch(e =>{
      throw e;
    });
});

router.delete('/file/delete/:fileId', (req, res) => {

  db.deleteFile(req.params.fileId)
    .then((file) =>{
      return res.json(file);
    })
    .catch(e =>{
      throw e;
    });
});
router.post('/', (req, res) => {
  console.log("SESSION:", req.session);
  // console.log(req.body.user);
  console.log(req.body.user);
  db.saveFile(req.body.fileName, req.body.fileText, req.body.user)
    .then(() =>{
      db.getUserFiles(req.body.user.id)
        .then(files=>{
          return res.json(files);
        })
        .catch(e =>{
          throw e;
        });
    })
    .catch(e => {
      throw e;
    });

});

router.post('/users/sign-up', (req, res, next) => {
  passport.authenticate('local-signup', function(error, user){
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.redirect("/");
    }

    req.logIn(user, function(error){

      if (error) {
        return next(error);
      }

      return res.json({
        id: req.user.id,
        username: req.user.name
      });
    });
  })(req, res, next);
});

router.post('/users/sign-in', (req, res, next)=>{
  passport.authenticate('local-login', function(error, user){
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.redirect("/");
    }
    req.logIn(user, function(error){

      if (error) {
        return next(error);
      }
      return db.getUserFiles()
        .then(files =>{
          console.log("User found is:", user);
          if (user.last_edited){
            console.log("Last Edited:", user.last_edited)
          }
          return res.json({
            user: {
              id: req.user.id,
              username: req.user.name
            },
            files,
            last_edited: user.last_edited
          });


        });
    });
  })(req, res, next);

});
router.get('/users/sign-out', (req, res)=>{
  req.logOut();
  res.redirect("/");
});
module.exports = router;
