const winston = require('winston');
const fs = require('fs');
const crypto = require('crypto');

class FileDocumentStore {

	constructor(options){
		this.basePath = options.path || './data';
		this.expire = options.expire;
	}

	//save data in a file, key as md5 - since we don't know what we can passed here
	async set(key, data, skipExpire){
		const _this = this;
		const filePath = this.getPath(key);

		if (!fs.existsSync(this.basePath)){
			winston.debug('creating data storage directory', { filename: this.basePath });
			await fs.promises.mkdir(this.basePath, {mode: '700'})
				.catch(err => {
					winston.error('error while creating dir', { path: _this.basePath, error: err });
				});
		}

		winston.silly('set key', { type: 'file', filename: filePath });
		return await fs.promises.writeFile(filePath, data, {mode: '600'})
			.then(() => {
				if (_this.expire && !skipExpire){
					winston.warn('file store doesn\'t support expiration', { file: filePath });
				}
				return true;
			})
			.catch(err => {
				winston.error('error while writing document to file', { file: filePath, error: err });
				return false;
			});
	}

	//get data from a file
	async get(key, skipExpire){
		const _this = this;
		const filePath = this.getPath(key);

		winston.silly('get key', { type: 'file', filename: filePath });
		return await fs.promises.readFile(filePath, {encoding: 'utf8'})
			.then(data => {
				if (_this.expire && !skipExpire){
					winston.warn('file store cannot set expirations on keys', { file: filePath });
				}
				return data;
			})
			.catch(err => {
				winston.debug('error while reading document', { file: filePath, error: err });
				return null;
			});
	}

	//generate a md5 hash of a key
	getPath(str){
		return require('path').join(this.basePath, crypto.createHash('md5').update(str).digest('hex'));
	}
}

module.exports = FileDocumentStore;
