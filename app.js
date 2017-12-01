const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const passport = require("passport");
const logger = require("morgan");
const index = require("./routes/index");
const app = express();

require("./configuration/passport.js")(passport);

app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser("triple_markdown"));
app.use(session(
  {
    secret: "triple_markdown",
    resave: "true",
    saveUninitialized: "false",
    cookie: {secure: false}
  }
));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", index);

app.use(function(req, res, next){
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.send(err);
});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
