var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// process.env.PORT needed as heroku dynamically assigns port.
// http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port ' + process.env.PORT + '!');
});