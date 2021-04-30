const crypto = require('crypto');
const rethink = require('rethinkdbdash');
const winston = require('winston');

const md5 = (str) => {
	const md5sum = crypto.createHash('md5');
	md5sum.update(str);
	return md5sum.digest('hex');
};

class RethinkDBStore {
	constructor(options) {
		this.expire = options.expire;
		this.table = options.table;
		this.client = rethink(options.clientOptions);
	}

	async set(key, data, skipExpire) {
		return await this.client.table(this.table).insert({ id: md5(key), data: data }).run()
			.then(() => {
				return true;
			})
			.catch(err => {
				winston.error('failed to insert to table', { error: err });
				return false;
			});
	}

	async get(key, skipExpire) {
		return await this.client.table(this.table).get(md5(key)).run()
			.then(result => {
				return result.data;
			})
			.catch(err => {
				winston.error('failed to insert to table', { error: err });
				return false;
			});
	}
}

module.exports = RethinkDBStore;
