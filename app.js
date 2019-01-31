const production = process.env.NODE_ENV == 'production';
console.log('NODE_ENV:', process.env.NODE_ENV);
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const createError = require('http-errors');
const favicon = require('serve-favicon')
const compression = require('compression')
const upload = require('express-fileupload');
const express = require('express');
let app = express();
const httpServer = http.createServer(app);
let io;
let httpsServer;
let credentials;

if (production) {
  credentials = {
    key: fs.readFileSync('/etc/letsenvrypt/live/joppekoers.nl/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsenvrypt/live/joppekoers.nl/cert.pem', 'utf8'),
    ca: fs.readFileSync('/etc/letsenvrypt/live/joppekoers.nl/chain.pem', 'utf8')
  };
  httpsServer = https.createServer(credentials, app);
  io = require('socket.io')(httpsServer);

  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
} else {
  io = require('socket.io')(httpServer);
}

const index = require('./routes/index.js');
const deletthis = require('./routes/deletthis.js')(io);

app.use(compression({ level: 9 }));
app.use(upload());
app.use(favicon(path.join(__dirname, 'public/logo/favicon.ico')))

app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'ejs');

// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public/')));

app.use('/', index);
app.use('/deletthis', deletthis);

app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = production ? {} : err;
  res.status(err.status || 500);
  if (!production) console.log(err);
  res.render('./error.ejs');
});


httpServer.listen(8080, () => { });
if (production) httpsServer.listen(8443, () => { });
