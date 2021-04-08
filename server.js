var express = require('express');
var app = express();
app.use(express.static('dist/rhrun'));
app.get('*', function(req, res, next) {
    res.sendFile('dist/rhrun/index.html', { root: __dirname });

});
app.listen(8080);