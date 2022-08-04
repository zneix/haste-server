const Redis = require('ioredis');
const logger = require('../lib/logger.js');
const oldRedis = new Redis({ host: '127.0.0.1', db: 2 });
const newRedis = new Redis({ host: '127.0.0.1', db: 15 });

(async () => {
	const oldPasteData = await oldRedis.keys('*');
	logger.info(`Current redis db has ${oldPasteData.length} keys.`);
	for (const paste of oldPasteData) {
		logger.info(`Handling paste ${paste}`);
		const pasteContent = await oldRedis.get(paste);

		const newFormat = JSON.stringify({
			data: pasteContent,
			deleteKey: null,
			creationDate: null
		});

		await newRedis.hset('hastebin', paste, newFormat);
	}
})();

