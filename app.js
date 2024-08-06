const fs = require('node:fs');

const fastify = require('./lib/fastify.js');

const logger = require('./lib/logger.js');

const DocumentHandler = require('./lib/document_handler');

(async function () {
	if (!fs.existsSync('./config.js')) {
		logger.error('Cannot find config.js!');
		process.exit(1);
	}

	const config = require('./config.js');

	if (!config.host || !config.port) {
		logger.error('Mandatory config options missing! (Host, Port)');
		process.exit(1);
	}

	// Set storage to file if not specified
	if (!config.storage) {
		config.storage = {
			type: 'file',
			path: './data'
		};
	}

	// Configure keygenerator or fallback to random if not specified
	const pwOptions = config.keyGenerator || {};
	pwOptions.type = pwOptions.type || 'random';
	const Gen = require(`./lib/key_generators/${pwOptions.type}`);
	const keyGenerator = new Gen(pwOptions);

	// Configure the document store
	const Store = require(`./lib/document_stores/${config.storage.type}`);
	const preferredStore = new Store(config.storage);

	// Configure the Document Handler
	const documentHandler = new DocumentHandler({
		store: preferredStore,
		maxLength: config.maxLength,
		keyLength: config.keyLength,
		keyGenerator
	});

	// send the static documents into the preferred store, skipping expirations
	for (const name in config.documents) {
		const path = config.documents[name];
		logger.info({ documentName: name, path }, 'loading static document');
		const data = fs.readFileSync(path, 'utf8');
		if (data) {
			await preferredStore.set(name, data, true);
		} else {
			logger.warn({ documentName: name, path }, 'failed to load static document');
		}
	}

	// Route Configuration

	// Handle Favicon
	fastify.get('/favicon.ico', async (request, reply) => reply.sendFile('favicon.ico'));

	// Render index page or document if requested
	fastify.get('/:id', async (request, reply) => reply.sendFile('index.html'));
	fastify.get('/', async (request, reply) => reply.sendFile('index.html'));

	// Get a raw Document
	fastify.get('/raw/:id', async (request, reply) => {
		const key = request.params.id;
		const skipExpire = Boolean(config.documents[key]);
		const document = await documentHandler.fetchDocument(key, skipExpire);
		if (!document) {
			return reply.notFound('Document not found');
		}
		reply.send(document);
	});

	// Get Document as JSON
	fastify.get('/documents/:id', async (request, reply) => {
		const key = request.params.id;
		const skipExpire = Boolean(config.documents[key]);
		const document = await documentHandler.fetchDocument(key, skipExpire);
		if (!document) {
			return reply.notFound('Document not found');
		}
		reply.send({ data: document, key });
	});

	// Create a new Document
	fastify.post('/documents', async (request, reply) => {
		const documentData = request.body;
		if (!documentData) {
			return reply.lengthRequired('Empty POST Body received!');
		}

		const contentLength = request.headers['content-length'];
		if (config.maxLength && contentLength > config.maxLength) {
			return reply.payloadTooLarge('Document is too large!');
		}

		const { pasteKey, deleteKey } = await documentHandler.createNewDocument(documentData);
		if (!pasteKey) {
			return reply.internalServerError();
		}

		reply.send({ key: pasteKey, deleteKey });
	});

	// Delete a Document
	fastify.delete('/documents', async (request, reply) => {
		const pasteKey = request.query.pasteKey;
		const deleteKey = request.query.deleteKey;
		if (!pasteKey || !deleteKey) {
			return reply.badRequest('Missing pasteKey and/or deleteKey queryparams');
		}

		const deleteResult = await documentHandler.deleteDocument(pasteKey, deleteKey);
		switch (deleteResult) {
		case null: {
			return reply.notFound('Document not found');
		}
		case false: {
			return reply.forbidden('Invalid Delete Key');
		}
		case true: {
			return reply.send('Document deleted successfully.');
		}
		default: {
			return reply.internalServerError();
		}
		}
	});

	fastify.listen({ port: config.port, host: config.host });
})();
