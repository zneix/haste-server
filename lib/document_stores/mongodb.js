const winston = require('winston');
const mongodb = require('mongodb');

class MongoDocumentStore {
	constructor(config){
		this.expire = config.expire;
		this.MongoClient = new mongodb.MongoClient(config.connectionUri, config.clientOptions);
	}

	async set(key, data, callback, skipExpire){
		winston.silly(`mongo set ${key}`);
		const now = Math.floor(Date.now() / 1000);
		const that = this;

		if ((await this.safeConnect()).error) return null;

		return await this.MongoClient.db().collection('entries').updateOne(
			{
				'entry_id': key,
				$or: [
					{ expiration: -1 },
					{ expiration: { $gt: now } }
				]
			},
			{
				$set: {
					'entry_id': key,
					value: data,
					expiration: that.expire && !skipExpire ? that.expire + now : -1
				}
			},
			{
				upsert: true
			}
		)
			.then((err, result) => {
				return true;
			})
			.catch((err, result) => {
				winston.error('error updating mongodb document', { error: err });
				return false;
			});
	}
	async get(key, skipExpire){
		winston.silly(`mongo get ${key}`);
		const now = Math.floor(Date.now() / 1000);
		const that = this;

		if ((await this.safeConnect()).error) return null;

		let document = await this.MongoClient.db().collection('entries').findOne({
			'entry_id': key,
			$or: [
				{ expiration: -1 },
				{ expiration: { $gt: now } }
			]
		}).catch(err => {
			winston.error('error finding mongodb document', { error: err });
			return null;
		});

		if (document && document.expiration != -1 && that.expire && !skipExpire) {
			await this.MongoClient.db().collection('entries').updateOne(
				{ 'entry_id': key },
				{ $set: { expiration: that.expire + now } }
			).catch(err => {
				return winston.warn('error extending expiry of mongodb document', { error: err });
			});
			winston.silly('extended expiry of mongodb document', { key: key, timestamp: that.expire + now });
		}
		return document ? document.value : null;
	}
	safeConnect(){
		//don't try connecting again if already connected
		//https://jira.mongodb.org/browse/NODE-1868
		if (this.MongoClient.isConnected()) return { error: null };
		return this.MongoClient.connect()
			.then(client => {
				winston.debug('connected to mongodb', { success: true });
				return { error: null };
			})
			.catch(err => {
				winston.error('error connecting to mongodb', { error: err });
				return { error: err };
			});
	}
}




module.exports = MongoDocumentStore;