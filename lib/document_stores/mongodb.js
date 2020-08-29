const winston = require('winston');
const mongodb = require('mongodb');

const MongoDocumentStore = function (config){
	this.expire = config.expire;
	this.MongoClient = new mongodb.MongoClient(config.connectionUri, config.clientOptions);
};

MongoDocumentStore.prototype.set = async function (key, data, callback, skipExpire){
	winston.silly(`mongo set ${key}`);
	const now = Math.floor(Date.now() / 1000);
	const that = this;

	await this.safeConnect(async ( {error} = {} ) => {
		if (error) return callback(false);

		await this.MongoClient.db().collection('entries').updateOne(
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
				return callback(true);
			})
			.catch((err, result) => {
				winston.error('error updating mongodb document', { error: err });
				return callback(false);
			});
	});
};

MongoDocumentStore.prototype.get = async function (key, callback, skipExpire){
	winston.silly(`mongo get ${key}`);
	const now = Math.floor(Date.now() / 1000);
	const that = this;

	await this.safeConnect(async ( {error} = {} ) => {
		if (error) return callback(false);

		let document = await this.MongoClient.db().collection('entries').findOne({
			'entry_id': key,
			$or: [
				{ expiration: -1 },
				{ expiration: { $gt: now } }
			]
		})
			.catch(err => {
				winston.error('error finding mongodb document', { error: err });
				return callback(false);
			});

		callback(document ? document.value : false);

		if (document && document.expiration != -1 && that.expire && !skipExpire){
			await this.MongoClient.db().collection('entries').updateOne(
				{ 'entry_id': key },
				{ $set: { expiration: that.expire + now } }
			).catch(err => {
				return winston.warn('error extending expiry of mongodb document', { error: err });
			});
			winston.silly('extended expiry of mongodb document', { key: key, timestamp: that.expire + now });
		}
	});
};

MongoDocumentStore.prototype.safeConnect = function(cb){
	//don't try connecting again if already connected
	//https://jira.mongodb.org/browse/NODE-1868
	if (this.MongoClient.isConnected()) return cb({error: null});
	this.MongoClient.connect()
		.then(client => {
			winston.debug('connected to mongodb', { success: true });
			cb({error: null});
		})
		.catch(err => {
			winston.error('error connecting to mongodb', { error: err });
			cb({error: err});
		});
};

module.exports = MongoDocumentStore;