const crypto = require('node:crypto');

const logger = require('./logger.js');

// For handling and serving stored documents
class DocumentHandler {
	constructor (options = {}) {
		this.keyLength = options.keyLength || 10;
		this.maxLength = options.maxLength; // none by default
		this.store = options.store;
		this.keyGenerator = options.keyGenerator;
	}

	// Retrieve a document from the document store
	async fetchDocument (key, skipExpire) {
		const data = await this.store.get(key, skipExpire);

		if (!data) {
			return null;
		}

		const paste = JSON.parse(data);
		return paste.pasteContent;
	}

	// Delete a document from the document store
	async deleteDocument (pasteKey, deleteKey) {
		const data = await this.store.get(pasteKey, true);

		if (!data) {
			return null;
		}

		const paste = JSON.parse(data);

		if (paste.meta.deleteKey === deleteKey) {
			await this.store.delete(pasteKey);
		} else {
			return false;
		}

		return true;
	}

	// Create a new document
	async createNewDocument (data) {
		const pasteKey = await this.chooseKey();
		const deleteKey = this.generateDeleteKey();
		const creationDate = new Date();

		const pasteData = {
			pasteContent: data,
			meta: {
				creationDate,
				deleteKey
			}
		};
    
		const success = await this.store.set(pasteKey, JSON.stringify(pasteData));
		if (!success) {
			logger.error('Error storing document!');
			return null;
		}
    
		logger.debug({ pasteKey }, 'Created document');
		return { pasteKey, deleteKey };
	}

	generateDeleteKey () {
		return crypto.randomUUID();
	}

	// keep choosing keys until one isn't taken
	async chooseKey () {
		const key = this.acceptableKey();

		const data = await this.store.get(key, true); // don't bump expirations on key searching
		if (data) {
			return this.chooseKey();
		}

		return key;
	}

	acceptableKey () {
		return this.keyGenerator.createKey(this.keyLength);
	}
}

module.exports = DocumentHandler;
