const express = require('express');
const bodyParser = require('body-parser');
const app = express();


app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => res.render('index'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
