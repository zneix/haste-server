const fsp = require('fs/promises');
const fs = require('fs');
const crypto = require('crypto');

const logger = require('../logger.js');

class FileDocumentStore {
	constructor (options) {
		this.basePath = options.path || './data';
		this.expire = options.expire;
	}

	// save data in a file, key as md5 - since we don't know what we can passed here
	async set (key, data, skipExpire) {
		const _this = this;
		const filePath = this.getPath(key);

		if (!fs.existsSync(this.basePath)) {
			logger.debug({ filename: this.basePath }, 'Creating data directory');
			await fsp.mkdir(this.basePath, { mode: '700' })
				.catch(e => {
					logger.error({ path: _this.basePath, error: e }, 'Error creating data directory');
				});
		}

		logger.debug({ key, filePath }, 'Save File');
		return await fsp.writeFile(filePath, data, { mode: '600' })
			.then(() => {
				if (_this.expire && !skipExpire) {
					logger.warn({ file: filePath }, 'File store does not support expiration');
				}
				return true;
			})
			.catch(e => {
				logger.error({ file: filePath, error: e }, 'Error while writing document to file');
				return false;
			});
	}

	// get data from a file
	async get (key, skipExpire) {
		const _this = this;
		const filePath = this.getPath(key);

		logger.debug({ type: 'file', filename: filePath }, 'Get document');
		return await fsp.readFile(filePath, { encoding: 'utf8' })
			.then(data => {
				if (_this.expire && !skipExpire) {
					logger.warn({ file: filePath }, 'File store does not support expiration');
				}
				return data;
			})
			.catch(e => {
				if (e.code === 'ENOENT') {
					logger.warn({ file: filePath }, 'Cannot find document on disk');
				} else {
					logger.error({ file: filePath, error: e }, 'Error while reading document');
				}
				return null;
			});
	}

	// Delete a file
	async delete (key) {
		const filePath = this.getPath(key);

		logger.debug({ filename: filePath }, 'Deleting document');
		await fsp.unlink(filePath)
			.catch(e => {
				if (e.code === 'ENOENT') {
					logger.warn({ file: filePath }, 'Cannot find document on disk');
				} else {
					logger.error({ file: filePath, error: e }, 'Error while deleting document');
				}
				return null;
			});
	}

	// generate a md5 hash of a key
	getPath (str) {
		return require('path').join(this.basePath, crypto.createHash('md5').update(str).digest('hex'));
	}
}

module.exports = FileDocumentStore;
