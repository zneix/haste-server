const Redis = require('ioredis');
const logger = require('../logger.js');

class RedisDocumentStore {
	constructor (options = {}) {
		this.expire = options.expire;
		const redisClient = new Redis(options.redisOptions);
		
		redisClient.on('error', e => {
			logger.error({ error: e }, 'Error occurred in redis client');
			process.exit(1);
		});
		redisClient.on('ready', () => {
			logger.info(`Connected to Redis: ${redisClient.options.host}:${redisClient.options.port}/${redisClient.options.db}`);
		});
		this.client = redisClient;
	}

	async set (key, data, skipExpire) {
		return await this.client.set(key, data)
			.then(() => {
				if (!skipExpire) {
					this.setExpiration(key);
				}
				return true;
			})
			.catch(error => {
				logger.error({ error }, 'Failed to save document to redis');
				return false;
			});
	}

	async get (key, skipExpire) {
		return await this.client.get(key)
			.then(data => {
				if (!skipExpire) {
					this.setExpiration(key);
				}
				return data;
			})
			.catch(error => {
				logger.error({ key, error }, 'Failed to get document from redis');
				return null;
			});
	}

	async delete (key) {
		return await this.client.delete(key)
			.catch(error => {
				logger.error({ key, error }, 'Failed to delete document from redis');
				return false;
			});
	}

	async setExpiration (key) {
		if (!this.expire) {
			return;
		}
		await this.client.expire(key, this.expire).catch(error => {
			logger.error({ key, error }, 'Failed to set expiry for redis key');
		});
	}
}

module.exports = RedisDocumentStore;
