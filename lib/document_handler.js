const winston = require('winston');
const Busboy = require('busboy');

// For handling serving stored documents

const DocumentHandler = function(options){
	if (!options) options = new Object;
	this.keyLength = options.keyLength || DocumentHandler.defaultKeyLength;
	this.maxLength = options.maxLength; // none by default
	this.store = options.store;
	this.keyGenerator = options.keyGenerator;
};

DocumentHandler.defaultKeyLength = 10;

// Handle retrieving a document
DocumentHandler.prototype.handleGet = async function(key, res, skipExpire){
	const data = await this.store.get(key, skipExpire);

	//when data is null it means there was either no data or an error
	if (!data){
		winston.warn('document not found', { key: key });
		res.status(404).json({ message: 'Document not found.' });
		return;
	}
	winston.verbose('retrieved document', { key: key });
	res.status(200).json({ data: data, key: key });
	return;
};

// Handle retrieving the raw version of a document
DocumentHandler.prototype.handleGetRaw = async function(key, res, skipExpire){
	const data = await this.store.get(key, skipExpire);

	if (!data){
		winston.warn('raw document not found', { key: key });
		res.status(404).json({ message: 'Document not found.' });
		return;
	}
	winston.verbose('retrieved raw document', { key: key });
	res.status(200).end(data);
};

// Handle adding a new Document
DocumentHandler.prototype.handlePost = function (req, res){
	let _this = this;
	let buffer = '';
	let cancelled = false;

	//parse a form to grab the data
	let ct = req.headers['content-type'];
	if (ct && ct.split(';')[0] == 'multipart/form-data'){
		winston.debug('okayge');
		let busboy = new Busboy({ headers: req.headers });
		busboy.on('field', (fieldname, val) => {
			if (fieldname == 'data'){
				buffer = val;
			}
		});
		busboy.on('finish', async function (){
			await onSuccess();
		});
		req.pipe(busboy);
	//otherwise, grab flat data from POST body
	}
	else {
		req.on('data', data => {
			buffer += data.toString();
		});
		req.on('end', async () => {
			if (cancelled) return;
			await onSuccess();
		});
		req.on('error', error => {
			winston.error(`busboy connection error: ${error.message}`);
			res.status(500).json({ message: 'Internal server error occured while adding document.' });
			cancelled = true;
		});
	}

	let onSuccess = async function (){
		//check length
		if (_this.maxLength && buffer.length > _this.maxLength){
			cancelled = true;
			winston.warn('document >maxLength', { maxLength: _this.maxLength });
			res.status(413).json({ message: 'Document exceeds maximum length.' });
			return;
		}
		//and save
		const key = await _this.chooseKey();
		const success = await _this.store.set(key, buffer);
		if (!success){
			winston.verbose('error adding document');
			res.status(500).json({ message: 'Internal server error occured while adding document.' });
			return;
		}
		winston.verbose('added document', { key: key });
		res.status(200).json({ key: key });
	};
};

//keep choosing keys until one isn't taken
DocumentHandler.prototype.chooseKey = async function(){
	let key = this.acceptableKey();
	let data = await this.store.get(key, true); //don't bump expirations on key searching
	if (data) return this.chooseKey();
	return key;
};

DocumentHandler.prototype.acceptableKey = function(){
	return this.keyGenerator.createKey(this.keyLength);
};

module.exports = DocumentHandler;
