/* global describe, it */

const { strictEqual } = require('assert');
const DocumentHandler = require('../lib/document_handler');
const Generator = require('../lib/key_generators/random');

describe('DocumentHandler', ()=> {
	describe('random', ()=> {
		it('should choose a key of the proper length', ()=> {
			const gen = new Generator();
			const dh = new DocumentHandler({ keyLength: 6, keyGenerator: gen });
			strictEqual(6, dh.acceptableKey().length);
		});
	});
});
