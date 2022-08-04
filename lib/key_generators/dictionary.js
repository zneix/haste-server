const fs = require('fs');

module.exports = class DictionaryGenerator {
	constructor ({ path } = {}) {
		// check for dictionary path
		if (!path) {
			const error = 'No dictionary path specified in options';
			throw error;
		}

		// load dictionary
		if (!fs.existsSync(path)) {
			const error = `Dictionary file "${path}" doesn't exist`;
			throw error;
		}

		this.dictionary = fs.readFileSync(path).toString().split(/\s+/gm);
	}

	// Generates a dictionary-based key, of keyLength words
	createKey (keyLength) {
		return Array(keyLength).fill().map(() => this.dictionary[ Math.floor(Math.random() * this.dictionary.length) ]).join('');
	}
};
