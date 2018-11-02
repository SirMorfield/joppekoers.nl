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

const credentials = {
  key: fs.readFileSync(path.join(__dirname, './bin/privkey.pem'), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, './bin/cert.pem'), 'utf8'),
  ca: fs.readFileSync(path.join(__dirname, './bin/chain.pem'), 'utf8')
};

const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);
const io = require('socket.io')(httpsServer);

const index = require('./routes/index.js');
const deletthis = require('./routes/deletthis.js')(io);

app.enable('trust proxy');

app.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

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
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.use(compression());

httpServer.listen(8080, () => console.log('HTTP Server running on port 8080'));
httpsServer.listen(8443, () => console.log('HTTPS Server running on port 8443'));
