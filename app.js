const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon')
const compression = require('compression')

const upload = require('express-fileupload');

let app = express();
app.use(upload());
app.use(compression());
app.use(favicon(path.join(__dirname, 'public/logo/favicon.ico')))

// view engine setup
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/')));

const index = require('./routes/index.js');
app.use('/', index);
const deletthis = require('./routes/deletthis.js');
app.use('/deletthis', deletthis);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
