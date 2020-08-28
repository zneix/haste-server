const fs = require('fs');
const crypto = require('crypto');

const winston = require('winston');

// For storing in files
// options[type] = file
// options[path] - Where to store

class FileDocumentStore {

	constructor(options){
		this.basePath = options.path || './data';
		this.expire = options.expire;
	}

	//save data in a file, key as md5 - since we don't know what we can passed here
	set(key, data, callback, skipExpire){
		const _this = this;
		const filePath = this.getPath(key);
		
		try {
			if (!fs.existsSync(this.basePath)){
				winston.debug('creating data storage directory', { filename: this.basePath });
				fs.mkdirSync(this.basePath, {mode: '700'});
			}

			try {
				fs.writeFileSync(filePath, data);
				callback(true);
				if (_this.expire && !skipExpire){
					winston.warn('file store cannot set expirations on keys', { file: filePath });
				}
			}
			catch (err){
				winston.error('error while writing document to file', { file: filePath, error: err });
				callback(false);
			}
		}
		catch (err){
			winston.error('error while creating dir', { path: _this.basePath, error: err });
			return callback(false);
		}
	}

	//get data from a file
	get(key, callback, skipExpire){
		const _this = this;
		const filePath = this.getPath(key);
		
		try {
			winston.silly('get key', { type: 'file', filename: filePath });
			let data = fs.readFileSync(filePath).toString();
			callback(data);
			if (_this.expire && !skipExpire){
				winston.warn('file store cannot set expirations on keys', { file: filePath });
			}
		}
		catch (err){
			winston.debug('error while reading document', { file: filePath, error: err });
			return callback(false);
		}
	}

	//generate a md5 hash of a key
	getPath(str){
		return require('path').join(this.basePath, crypto.createHash('md5').update(str).digest('hex'));
	}
}

module.exports = FileDocumentStore;
