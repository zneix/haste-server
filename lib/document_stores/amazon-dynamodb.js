const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const winston = require('winston');

class AmazonDynamoDBDocumentStore {
	constructor(options) {
		this.expire = options.expire;
		this.table = options.table;
		this.client = new DynamoDBClient(options.clientOptions);
	}

	async get(key, skipExpire) {
		const _this = this;

		const command = new GetItemCommand({
			TableName: _this.table,
			Key: {
				key: {
					S: key
				}
			},
			AttributesToGet: ['value']
		});
		return await _this.client.send(command)
			.then(output => {
				if (_this.expire && !skipExpire) {
					winston.warn('amazon dynamodb store cannot set expirations on keys');
				}
				return output.Item.value.S;
			})
			.catch(err => {
				winston.error('failed to get amazon dynamodb document', { error: err });
				return false;
			});
	}

	async set(key, data, skipExpire) {
		const _this = this;

		const command = new PutItemCommand({
			TableName: _this.table,
			Item: {
				key: {
					S: key
				},
				value: {
					S: data
				}
			},
		});
		return await _this.client.send(command)
			.then(() => {
				if (_this.expire && !skipExpire) {
					winston.warn('amazon dynamodb store cannot set expirations on keys');
				}
				return true;
			})
			.catch(err => {
				winston.error('failed to set amazon dynamodb document', { key: key, error: err });
				return false;
			});
	}
}

module.exports = AmazonDynamoDBDocumentStore;
