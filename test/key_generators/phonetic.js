/* global describe, it */

const assert = require('assert');
const Generator = require('../../lib/key_generators/phonetic');

describe('KeyGenerator', () => {
	describe('phonetic', () => {
		it('should return a key of the proper length', () => {
			const gen = new Generator();
			assert.strictEqual(6, gen.createKey(6).length);
		});

		it('should alternate consonants and vowels', () => {
			const gen = new Generator();

			const vowels = 'aeiouy';
			const key = gen.createKey(3);

			if (vowels.includes(key[0])) assert.ok(vowels.includes(key[2]));
			else assert.ok(vowels.includes(key[1]));
		});
	});
});
