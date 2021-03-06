// server.js
// where your node app starts

// init project
const express = require("express");
const expressHbs = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const { createPogoImage, createPogoImagePng } = require('./pogo');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', expressHbs());

app.set('view engine', 'handlebars');
// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

const port = process.env.PORT || 3000;

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.get('/demo', (req, res) => {
  res.sendFile(`${__dirname}/views/demo.html`);
});

app.get('/:name/:code', async (req, res) => {
  const { name, code } = req.params;

  const title = `${name} | Trainer Card Buddy`;
  const description = `Add ${name} on Pokemon Go! My trainer code is ${code}.`;
  const query = req.query['style'] ? `?style=${req.query['style']}` : '';
  
  const url = `https://www.pkmngo.me/${name}/${code}${query}`;

  return res.render('trainer', { layout: false, title: title, description: description, url: url });
});

app.get('/:name/:code/card.svg', async (req, res) => {
  const { name, code } = req.params;
  
  const style = req.query['style'];

  if (!name || !code || code.length !== 14 ) {
    res.set({
      'content-type': 'image/svg+xml',
      'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
    }); 

    return fs.createReadStream(`${__dirname}/404.png`).pipe(res);
  }

  return await createPogoImage(res, name, code, style);
});


app.get('/:name/:code/card.png', async (req, res) => {
  const { name, code } = req.params;
  
  const style = req.query['style'];

  if (!name || !code || code.length !== 14 ) {
    res.set({
      'content-type': 'image/png',
      'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
    });

    return fs.createReadStream(`${__dirname}/404.png`).pipe(res);
  }

  
  return await createPogoImagePng(res, name, code, style);
});

// listen for requests :)
var listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});