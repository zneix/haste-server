/* global describe, it */

const fs = require('fs');
const assert = require('assert');
const Generator = require('../../lib/key_generators/dictionary');

const tmpPath = '/tmp/haste-server-test-dictionary';

describe('KeyGenerator', () => {
	describe('dictionary', () => {
		it('should throw an error if given no path', () => {
			assert.throws(() => { new Generator(); });
		});

		it('should throw an error if given invalid path', () => {
			if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
			assert.throws(() => { new Generator({path: tmpPath}); });
		});

		it('should return a key of the proper number of words from the given dictionary', () => {
			const words = ['xd'];
			fs.writeFileSync(tmpPath, words.join('\n'));

			const gen = new Generator({path: tmpPath});
			assert.strictEqual('xdxdxd', gen.createKey(3));
		});
	});
});
