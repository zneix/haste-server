const path = require('path');

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

// Initialize fastify
const fastify = require('fastify')({
	trustProxy: true,
	logger: {
		level: 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'dd.mm.yy HH:MM:s.l',
				ignore: 'pid,hostname'
			}
		}
	},
	disableRequestLogging: true
});

// Register fastify plugins
fastify.register(require('@fastify/sensible'));

fastify.register(require('@fastify/static'), {
	root: path.join(__dirname, '../static')
});

// Set fastify error handler
fastify.setErrorHandler((error, request, reply) => {
	const statusCode = error.statusCode ?? reply.statusCode;

	const responseObject = {
		statusCode,
		error: error.name,
		message: error.message
	};

	if (statusCode >= 500) {
		fastify.log.error(error);
	}

	reply.status(statusCode).send(responseObject);
});

module.exports = fastify;
