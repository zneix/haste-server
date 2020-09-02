const Redis = require('ioredis');
const winston = require('winston');

class RedisDocumentStore {

	constructor(options = {}){
		this.expire = options.expire;
		const redisClient = new Redis(options.redisOptions);
		
		redisClient.on('error', err => {
			winston.error('redisClient errored', {error: err});
			process.exit(1);
		});
		redisClient.on('ready', () => {
			winston.info(`connected to redis on ${redisClient.options.host}:${redisClient.options.port}/${redisClient.options.db}`);
		});
		this.client = redisClient;
		winston.info('initialized redis client');
	}

	async set(key, data, skipExpire){
		return await this.client.set(key, data)
			.then(() => {
				if (!skipExpire) this.setExpiration(key);
				return true;
			})
			.catch(err => {
				winston.error('failed to set redis document', {error: err});
				return false;
			});
	}

	async get(key, skipExpire){
		return await this.client.get(key)
			.then(data => {
				if (!skipExpire) this.setExpiration(key);
				return data;
			})
			.catch(err => {
				winston.error('failed to get redis document', {key: key, error: err});
				return null;
			});
	}

	async setExpiration(key){
		if (!this.expire) return;
		await this.client.expire(key, this.expire).catch(err => {
			winston.warn('failed to set redis key expiry', {key: key, error: err});
		});
	}
}

module.exports = RedisDocumentStore;