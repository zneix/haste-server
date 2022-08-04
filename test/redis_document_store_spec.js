/* global it, describe, afterEach */

const assert = require('assert');

const RedisDocumentStore = require('../lib/document_stores/redis');

describe('redis_document_store', ()=> {
	/* reconnect to redis on each test */
	afterEach(()=> {
		if (RedisDocumentStore.client) {
			RedisDocumentStore.client.quit();
			RedisDocumentStore.client = false;
		}
	});

	describe('set', ()=> {
		it('should be able to set a key and have an expiration set', (done)=> {
			const store = new RedisDocumentStore({ expire: 10 });
			store.set('hello1', 'world', ()=> {
				RedisDocumentStore.client.ttl('hello1', (err, res)=> {
					assert.ok(res > 1);
					done();
				});
			});
		});

		it('should not set an expiration when told not to', (done)=> {
			const store = new RedisDocumentStore({ expire: 10 });
			store.set('hello2', 'world', ()=> {
				RedisDocumentStore.client.ttl('hello2', (err, res)=> {
					assert.equal(-1, res);
					done();
				});
			}, true);
		});

		it('should not set an expiration when expiration is off', (done)=> {
			const store = new RedisDocumentStore({ expire: false });
			store.set('hello3', 'world', ()=> {
				RedisDocumentStore.client.ttl('hello3', (err, res)=> {
					assert.equal(-1, res);
					done();
				});
			});
		});
	});
});
