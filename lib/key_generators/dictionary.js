const winston = require('winston');
const fs = require('fs');

module.exports = class DictionaryGenerator {

	constructor({ path } = {}, readyCallback){
		//check for dictionary path
		if (!path){
			winston.error('No dictionary path specified in options');
			process.exit(1);
		}

		//load dictionary
		if (!fs.existsSync(path)){
			winston.error(`Dictionary file "${path}" doesn't exist`);
			process.exit(1);
		}

		this.dictionary = fs.readFileSync(path).toString().split(/\s+/gm);
		if (readyCallback) readyCallback();
	}

	// Generates a dictionary-based key, of keyLength words
	createKey(keyLength){
		return Array(keyLength).fill().map(() => this.dictionary[ Math.floor(Math.random() * this.dictionary.length) ] ).join('');
	}

};
