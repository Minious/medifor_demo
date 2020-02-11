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
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('Serving ' + file + ' of type ' + type + ' to ' + ip)
	next();
});

app.get(['/images/*', '/graph/*'], function (req, res) {
	var file = path.join(__dirname, "dist", req.path.replace(/\/$/, '/index.html'));
	if (file.indexOf(__dirname + path.sep) !== 0) {
		return res.status(403).end('Forbidden');
	}
	var type = mime[path.extname(file).slice(1)] || 'text/plain';
	var s = fs.createReadStream(file);
	let defaultSize = {
		width: 500,
		height: 500,
	}
	s.on('open', function () {
		res.set('Content-Type', type);
		resize(s, defaultSize.width, defaultSize.height).pipe(res);
	});
	s.on('error', function () {
		res.set('Content-Type', 'text/plain');
		res.status(404).end('Not found');
	});
});

app.use(express.static(path.join(__dirname, "dist")));

app.listen(8000, () => {
  console.log('Medifor demo app listening on port 8000..')
});
