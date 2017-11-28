const express = require('express');
const bodyParser = require('body-parser');
const db = require("./controllers/db");
const app = express();


app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  db.getAllFiles()
    .then((files) =>{
      console.log(files);
      res.render("index", {files});
    })
    .catch(e =>{
      throw e;
    });
});
app.post('/', (req, res) => {
  console.log(req.body);
  db.saveFile(req.body.fileName, req.body.fileText)
    .then(() =>{
      res.send("woot");
    })
    .catch(e => {
      throw e;
    });

});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
