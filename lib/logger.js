const config = require('../config.js');

const Logger = require('pino')({
	level: config.logging?.level || 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'dd.mm.yy HH:MM:s.l',
			ignore: 'pid,hostname'
		}
	}
});

module.exports = Logger;
