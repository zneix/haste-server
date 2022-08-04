const mongodb = require('mongodb');

const logger = require('../logger.js');

class MongoDocumentStore {
	constructor (config) {
		this.expire = config.expire;
		this.MongoClient = new mongodb.MongoClient(config.connectionUri, config.clientOptions);
	}

	async set (key, data, callback, skipExpire) {
		logger.trace(`mongo set ${key}`);
		const now = Math.floor(Date.now() / 1000);
		const that = this;

		if ((await this.safeConnect()).error) {
			return false;
		}

		return await this.MongoClient.db().collection('entries').updateOne(
			{
				entry_id: key,
				$or: [
					{ expiration: -1 },
					{ expiration: { $gt: now } }
				]
			},
			{
				$set: {
					entry_id: key,
					value: data,
					expiration: that.expire && !skipExpire ? that.expire + now : -1
				}
			},
			{
				upsert: true
			}
		)
			.then(() => true)
			.catch((e) => {
				logger.error({ error: e }, 'error updating mongodb document');
				return false;
			});
	}
	async get (key, skipExpire) {
		logger.trace(`mongo get ${key}`);
		const now = Math.floor(Date.now() / 1000);
		const that = this;

		if ((await this.safeConnect()).error) {
			return null;
		}

		const document = await this.MongoClient.db().collection('entries').findOne({
			entry_id: key,
			$or: [
				{ expiration: -1 },
				{ expiration: { $gt: now } }
			]
		}).catch(e => {
			logger.error({ error: e }, 'error finding mongodb document');
			return null;
		});

		if (document && document.expiration !== -1 && that.expire && !skipExpire) {
			await this.MongoClient.db().collection('entries').updateOne(
				{ entry_id: key },
				{ $set: { expiration: that.expire + now } }
			).catch(e => logger.warn({ error: e }, 'error extending expiry of mongodb document'));
			logger.debug({ key, timestamp: that.expire + now }, 'extended expiry of mongodb document');
		}
		return document ? document.value : null;
	}
	async safeConnect () {
		// don't try connecting again if already connected
		// https://jira.mongodb.org/browse/NODE-1868
		if (this.MongoClient.isConnected()) {
			return { error: null };
		}
		return await this.MongoClient.connect()
			.then(() => {
				logger.info('connected to mongodb');
				return { error: null };
			})
			.catch(e => {
				logger.error({ error: e }, 'error connecting to mongodb');
				return { error: e };
			});
	}
}


module.exports = MongoDocumentStore;
