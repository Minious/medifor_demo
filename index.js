const express = require('express')
const path = require('path')
const fs = require('fs')

const resize = require('./resize')

const app = express();

var mime = {
	html: 'text/html',
	txt: 'text/plain',
	css: 'text/css',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	js: 'application/javascript'
};

app.use(function (req, res, next) {
	var file = path.join(__dirname, req.path.replace(/\/$/, '/index.html'));
	var type = mime[path.extname(file).slice(1)] || 'text/plain';
	console.log('Serving ' + file + ' of type ' + type);
	next();
});

app.get('/images/*', function (req, res) {
	var file = path.join(__dirname, req.path.replace(/\/$/, '/index.html'));
	if (file.indexOf(__dirname + path.sep) !== 0) {
		return res.status(403).end('Forbidden');
	}
	var type = mime[path.extname(file).slice(1)] || 'text/plain';
	var s = fs.createReadStream(file);
	s.on('open', function () {
		res.set('Content-Type', type);
		resize(s, 800, 800).pipe(res);
	});
	s.on('error', function () {
		res.set('Content-Type', 'text/plain');
		res.status(404).end('Not found');
	});
});

app.use(express.static(__dirname));


app.listen(8000, () => {
  console.log('Medifor demo app listening on port 8000..')
});
