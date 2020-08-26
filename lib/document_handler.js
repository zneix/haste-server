const winston = require('winston');
const Busboy = require('busboy');

// For handling serving stored documents

const DocumentHandler = function(options) {
  if (!options) options = new Object;
  this.keyLength = options.keyLength || DocumentHandler.defaultKeyLength;
  this.maxLength = options.maxLength; // none by default
  this.store = options.store;
  this.keyGenerator = options.keyGenerator;
};

DocumentHandler.defaultKeyLength = 10;

// Handle retrieving a document
DocumentHandler.prototype.handleGet = function(key, res, skipExpire) {
  this.store.get(key, function(ret) {
    if (ret) {
      winston.verbose('retrieved document', { key: key });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: ret, key: key }));
    }
    else {
      winston.warn('document not found', { key: key });
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'Document not found.' }));
    }
  }, skipExpire);
};

// Handle retrieving the raw version of a document
DocumentHandler.prototype.handleGetRaw = function(key, res, skipExpire) {
  this.store.get(key, function(ret) {
    if (ret) {
      winston.verbose('retrieved raw document', { key: key });
      res.writeHead(200, { 'content-type': 'text/plain; charset=UTF-8' });
      res.end(ret);
    }
    else {
      winston.warn('raw document not found', { key: key });
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'Document not found.' }));
    }
  }, skipExpire);
};

// Handle adding a new Document
DocumentHandler.prototype.handlePost = function (req, res) {
  let _this = this;
  let buffer = '';
  let cancelled = false;

  // What to do when done
  let onSuccess = function () {
    // Check length
    if (_this.maxLength && buffer.length > _this.maxLength) {
      cancelled = true;
      winston.warn('document >maxLength', { maxLength: _this.maxLength });
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({ message: 'Document exceeds maximum length.' })
      );
      return;
    }
    // And then save if we should
    _this.chooseKey(function (key) {
      _this.store.set(key, buffer, function (resp) {
        if (resp) {
          winston.verbose('added document', { key: key });
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ key: key }));
        }
        else {
          winston.verbose('error adding document');
          res.writeHead(500, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ message: 'Error adding document.' }));
        }
      });
    });
  };

  // If we should, parse a form to grab the data
  let ct = req.headers['content-type'];
  if (ct && ct.split(';')[0] == 'multipart/form-data') {
    let busboy = new Busboy({ headers: req.headers });
    busboy.on('field', function (fieldname, val) {
      if (fieldname == 'data') {
        buffer = val;
      }
    });
    busboy.on('finish', function () {
      onSuccess();
    });
    req.pipe(busboy);
  // Otherwise, use our own and just grab flat data from POST body
  } else {
    req.on('data', function (data) {
      buffer += data.toString();
    });
    req.on('end', function () {
      if (cancelled) { return; }
      onSuccess();
    });
    req.on('error', function (error) {
      winston.error('connection error: ' + error.message);
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'Connection error.' }));
      cancelled = true;
    });
  }
};

// Keep choosing keys until one isn't taken
DocumentHandler.prototype.chooseKey = function(callback) {
  let key = this.acceptableKey();
  let _this = this;
  this.store.get(key, function(ret) {
    if (ret) {
      _this.chooseKey(callback);
    } else {
      callback(key);
    }
  }, true); // Don't bump expirations when key searching
};

DocumentHandler.prototype.acceptableKey = function() {
  return this.keyGenerator.createKey(this.keyLength);
};

module.exports = DocumentHandler;
