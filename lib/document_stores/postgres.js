const winston = require('winston');
const postgres = require('pg');

class PostgresDocumentStore {
	constructor(options){
		this.expire = options.expire;
		this.PostgresClient = new postgres.Client(options.clientOptions);
		this.safeConnect();
		this.PostgresClient.on('end', () => {
			winston.debug('disconnected from pg!');
		});
	}

	async set(key, data, skipExpire){
		const now = Math.floor(Date.now() / 1000);

		return await this.PostgresClient.query(
			'INSERT INTO entries (key, value, expiration) VALUES ($1, $2, $3)',
			[ key, data, (this.expire && !skipExpire) ? this.expire + now : null ]
		)
			.then(() => {
				return true;
			})
			.catch(err => {
				winston.error('failed to set postgres document', { key: key, error: err });
				return false;
			});

	}

	async get(key, skipExpire){
		const now = Math.floor(Date.now() / 1000);

		return await this.PostgresClient.query(
			'SELECT id,value,expiration FROM entries WHERE key = $1 AND (expiration IS NULL OR expiration > $2)',
			[ key, now ])
			.then(async res => {
				if (res.rows.length && this.expire && !skipExpire){
					await this.PostgresClient.query(
						'UPDATE entries SET expiration = $1 WHERE ID = $2',
						[ this.expire + now, res.rows[0].id ]
					);
				}
				return res.rows.length ? res.rows[0].value : null;
			})
			.catch(err => {
				winston.error('error retrieving value from postgres', { error: err });
				return null;
			});
	}

	async safeConnect(){
		return await this.PostgresClient.connect()
			.then(() => {
				winston.info('connected to postgres!');
				return { error: null };
			})
			.catch(err => {
				winston.error('failed connecting to postgres!', {error: err});
				return { error: err };
			});
	}
}

module.exports = PostgresDocumentStore;
