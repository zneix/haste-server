const postgres = require('pg');

const logger = require('../logger.js');

class PostgresDocumentStore {
	constructor (options) {
		this.expire = options.expire;
		this.PostgresClient = new postgres.Pool(options.clientOptions);
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
			.catch(error => {
				logger.error({ key, error }, 'failed to set postgres document');
				return false;
			});
	}

	async get (key, skipExpire) {
		const now = Math.floor(Date.now() / 1000);

		return await this.PostgresClient.query(
			'SELECT id,value,expiration FROM entries WHERE key = $1 AND (expiration IS NULL OR expiration > $2)',
			[ key, now ])
			.then(async res => {
				if (res.rows.length > 0 && this.expire && !skipExpire) {
					await this.PostgresClient.query(
						'UPDATE entries SET expiration = $1 WHERE ID = $2',
						[ this.expire + now, res.rows[0].id ]
					);
				}
				return res.rows.length > 0 ? res.rows[0].value : null;
			})
			.catch(error => {
				logger.error({ error }, 'error retrieving value from postgres');
				return null;
			});
	}

	async delete (key) {
		return await this.PostgresClient.query('DELETE FROM  entries WHERE ID = $1', [key])
			.catch(error => {
				logger.error({ key, error }, 'Failed to delete document from postgres');
				return false;
			});
	}

	async safeConnect () {
		return await this.PostgresClient.connect()
			.then(() => {
				logger.info('connected to postgres!');
				return { error: null };
			})
			.catch(error => {
				logger.error({ error }, 'failed connecting to postgres!');
				return { error };
			});
	}
}

module.exports = PostgresDocumentStore;
