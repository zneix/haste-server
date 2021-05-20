const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const winston = require('winston');
const stream = require('stream');
const { promisify } = require('util');
class AmazonS3DocumentStore {
	constructor(options) {
		this.expire = options.expire || 0;
		this.bucket = options.bucket;
		this.client = new S3Client(options.clientOptions);
	}

	async get(key, skipExpire) {
		const _this = this;

		const command = new GetObjectCommand({
			Bucket: _this.bucket,
			Key: key,
			ResponseContentType: 'text/plain'
		});

		return await _this.client.send(command)
			.then(output => {
				return new Promise((resolve) => {
          let data = '';
					output.Body.on('data', chunk => data += chunk.toString('utf-8'));
          output.Body.on('end', () => resolve(data));
					output.Body.on('error', () => resolve(false));
					output.Body.read();
					if (_this.expire && !skipExpire) {
            _this.set(key, data, skipExpire)
              .then(updateSucceeded => {
                if (!updateSucceeded) {
						      winston.warn('failed to update expirations on amazon s3 document');
                }
              })
					}
				});
			})
			.catch(err => {
				winston.error('failed to get amazon s3 document', { error: err });
				return false;
			});
	}

	async set(key, data, skipExpire) {
		const _this = this;
		let now = new Date();

		const command = new PutObjectCommand({
			Bucket: _this.bucket,
			Key: key,
			Body: data,
			ContentType: 'text/plain',
			Expires: (_this.expire && !skipExpire) ? now.setSeconds(now.getSeconds() + _this.expire) : undefined
		});
		return await _this.client.send(command)
			.then(() => {
				return true;
			})
			.catch(err => {
				winston.error('failed to set amazon s3 document', { key: key, error: err });
				return false;
			});
	}
}
module.exports = AmazonS3DocumentStore;
