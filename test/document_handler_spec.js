/* global describe, it */

const { strictEqual } = require('assert');
const DocumentHandler = require('../lib/document_handler');
const Generator = require('../lib/key_generators/random');

describe('DocumentHandler', function(){

	describe('random', function(){
		it('should choose a key of the proper length', function(){
			let gen = new Generator();
			let dh = new DocumentHandler({ keyLength: 6, keyGenerator: gen });
			strictEqual(6, dh.acceptableKey().length);
		});

		it('should choose a default key length', function(){
			let gen = new Generator();
			let dh = new DocumentHandler({ keyGenerator: gen });
			strictEqual(dh.keyLength, DocumentHandler.defaultKeyLength);
		});
	});

});
