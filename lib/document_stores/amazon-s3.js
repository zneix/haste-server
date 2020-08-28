const AWS = require('aws-sdk');
const winston = require('winston');

const AmazonS3DocumentStore = function(options){
	this.expire = options.expire;
	this.bucket = options.bucket;
	this.client = new AWS.S3({region: options.region});
};

AmazonS3DocumentStore.prototype.get = function(key, callback, skipExpire){
	const _this = this;

	const req = {
		Bucket: _this.bucket,
		Key: key
	};

	_this.client.getObject(req, function(err, data){
		if(err){
			callback(false);
		}
		else {
			callback(data.Body.toString('utf-8'));
			if (_this.expire && !skipExpire){
				winston.warn('amazon s3 store cannot set expirations on keys');
			}
		}
	});
};

AmazonS3DocumentStore.prototype.set = function(key, data, callback, skipExpire){
	const _this = this;

	const req = {
		Bucket: _this.bucket,
		Key: key,
		Body: data,
		ContentType: 'text/plain'
	};

	_this.client.putObject(req, function(err, data){
		if (err){
			callback(false);
		}
		else {
			callback(true);
			if (_this.expire && !skipExpire){
				winston.warn('amazon s3 store cannot set expirations on keys');
			}
		}
	});
};

module.exports = AmazonS3DocumentStore;
