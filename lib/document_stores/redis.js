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

	async set(key, data, callback, skipExpire){
		await this.client.set(key, data).catch(err => {
			winston.error('failed to call redisClient.set', {error: err});
			callback(false);
			return;
		});
		if (!skipExpire) this.setExpiration(key);
		callback(true);
	}

	async get(key, callback, skipExpire){
		let data = await this.client.get(key).catch(err => {
			winston.error('failed to get document from redis', {key: key, error: err});
			callback(false);
			return;
		});
		if (!skipExpire) this.setExpiration(key);
		callback(data);
	}

	async setExpiration(key){
		if (!this.expire) return;
		await this.client.expire(key, this.expire).catch(err => {
			winston.warn('failed to set expiry on key', {key: key, error: err});
		});
	}
}

module.exports = RedisDocumentStore;