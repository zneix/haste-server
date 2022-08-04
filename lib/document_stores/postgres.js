const postgres = require('pg');

const logger = require('../logger.js');

class PostgresDocumentStore {
	constructor (options) {
		this.expire = options.expire;
		this.PostgresClient = new postgres.Client(options.clientOptions);
		this.safeConnect();
		this.PostgresClient.on('end', () => {
			logger.debug('disconnected from pg!');
		});
	}

	async set (key, data, skipExpire) {
		const now = Math.floor(Date.now() / 1000);

		return await this.PostgresClient.query(
			'INSERT INTO entries (key, value, expiration) VALUES ($1, $2, $3)',
			[ key, data, (this.expire && !skipExpire) ? this.expire + now : null ]
		)
			.then(() => true)
			.catch(e => {
				logger.error({ key, error: e }, 'failed to set postgres document');
				return false;
			});
	}

	async get (key, skipExpire) {
		const now = Math.floor(Date.now() / 1000);

		return await this.PostgresClient.query(
			'SELECT id,value,expiration FROM entries WHERE key = $1 AND (expiration IS NULL OR expiration > $2)',
			[ key, now ])
			.then(async res => {
				if (res.rows.length && this.expire && !skipExpire) {
					await this.PostgresClient.query(
						'UPDATE entries SET expiration = $1 WHERE ID = $2',
						[ this.expire + now, res.rows[0].id ]
					);
				}
				return res.rows.length ? res.rows[0].value : null;
			})
			.catch(e => {
				logger.error({ error: e }, 'error retrieving value from postgres');
				return null;
			});
	}

	async safeConnect () {
		return await this.PostgresClient.connect()
			.then(() => {
				logger.info('connected to postgres!');
				return { error: null };
			})
			.catch(e => {
				logger.error({ error: e }, 'failed connecting to postgres!');
				return { error: e };
			});
	}
}

module.exports = PostgresDocumentStore;
