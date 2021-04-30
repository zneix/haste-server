const Cloudant = require('@cloudant/cloudant');
const winston = require('winston');

class CloudantStore {
	constructor(options) {
		this.db = options.db;
		this.expire = options.expire;
		this.client = Cloudant(options.clientOptions);
	}

	async get(key, skipExpire) {
		const _this = this;

		return await _this.client.use(_this.db).get(key)
			.then(data => {
				if (_this.expire && !skipExpire) {
					winston.warn('cloudant cannot set expirations on keys');
				}
				return data.value;
			})
			.catch(err => {
				winston.error('failed to get cloudant document', { error: err });
				return false;
			});
	}

	async set(key, data, skipExpire) {
		const _this = this;

		const doc = {
			_id: key,
			value: data
		};
		const etag = await _this.client.use(_this.db).head(key)
			.then(head => {
				return head ? head.etag.replace(/"/g, '') : '';
			})
			.catch(() => {
				return '';
			});
		if (etag) doc['_rev'] = etag;
		return await this.client.use(_this.db).insert(doc)
			.then(() => {
				if (_this.expire && !skipExpire) {
					winston.warn('cloudant cannot set expirations on keys');
				}
				return true;
			})
			.catch(err => {
				winston.error('failed to set cloudant document', { key: key, error: err });
				return false;
			});
	}
}

module.exports = CloudantStore;
