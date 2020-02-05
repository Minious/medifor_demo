const fs = require('fs')
const sharp = require('sharp')

module.exports = function resize(s, width, height) {
	let transform = sharp();
	if (width || height) {
		transform = transform.resize(width, height, {fit: 'inside'});
	}
	return s.pipe(transform);
}