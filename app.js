const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./controllers/db");
const app = express();

passport.use(new LocalStrategy(
  async function(username, password, done){
    const user = await db.getUser(username);
    if (user){
      const passwordMatch = db.checkPassword(user, password);
      if (passwordMatch){
        return done(null, user);
      } else{
        return done(null, false);
      }
    }else{
      return done(null, false);
    }
  }
));

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({secret: "triple_markdown"}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  done(null, user.name);
});

passport.deserializeUser(async function(name, done){
  try{
    const user = await db.getUser(name);
    if (!user){
      const error = new Error(`Cannot find user ${name} to deserialize`);
      throw error;
    }
  }catch(error){
    done(error, name);
  }
});

app.get('/', (req, res) => {
  console.log(req.session)
  db.getUserFiles()
    .then((files) =>{

      res.render("index", {files});
    })
    .catch(e =>{
      throw e;
    });
});

app.post('/', (req, res) => {
  db.saveFile(req.body.fileName, req.body.fileText)
    .then((file) =>{
      console.log(file);
      res.sendStatus(200);
    })
    .catch(e => {
      throw e;
    });

});
app.post('/users/sign-up', (req, res) => {
  console.log(req.body);
  return db.addUser(req.body["screen-name"], req.body.password)
    .then(user => {
      console.log("NEW USER SUCCESS:", user)
      res.sendStatus(200);
    })
    .catch(e =>{
      if (e.code === 409){
        res.sendStatus(409);
      }
    });
});


app.post('/users/sign-in', (req, res) => {
  //TODO: Implement Sign In
});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
