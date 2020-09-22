/* global describe, it */

const assert = require('assert');
const Generator = require('../../lib/key_generators/random');

describe('KeyGenerator', () => {
	describe('random', () => {
		it('should return a key of the proper length', () => {
			const gen = new Generator();
			assert.strictEqual(6, gen.createKey(6).length);
		});

		it('should use a key from the given keyset if given', () => {
			const gen = new Generator({keyspace: 'A'});
			assert.strictEqual('AAAAAA', gen.createKey(6));
		});
	});
});
