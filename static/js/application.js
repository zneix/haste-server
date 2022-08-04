/* global hljs */

// /// represents a single document
class HasteDocument {
	constructor (app) {
		this.locked = false;
		this.app = app;
	}
	// Escapes HTML tag characters
	htmlEscape (s) {
		return s
			.replace(/&/g, '&amp;')
			.replace(/>/g, '&gt;')
			.replace(/</g, '&lt;')
			.replace(/"/g, '&quot;');
	}
	// Get this document from the server and lock it here
	async load (key, lang) {
		const _this = this;
		const result = await fetch(`${_this.app.baseUrl}documents/${key}`, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!result.ok) {
			return false;
		}

		const { data } = await result.json();

		_this.locked = true;
		_this.key = key;
		_this.data = data;
		let high;
  
		try {
			if (lang === 'txt') {
				high = { value: _this.htmlEscape(data) };
			} else if (lang) {
				high = hljs.highlight(data, { language: lang });
			} else {
				high = hljs.highlightAuto(data);
			}
		} catch (e) {
			high = hljs.highlightAuto(data);
		}

		return {
			value: high.value,
			key,
			language: high.language || lang,
			lineCount: data.split('\n').length
		};
	}

	// Save this document to the server and lock it here
	async save (data) {
		if (this.locked) {
			return false;
		}

		this.data = data;
		const _this = this;

		const result = await fetch(`${_this.app.baseUrl}documents`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!result.ok) {
			if (result.status === 404 || result.status === 500) {
				const { message } = await result.json();
				return {
					error: message
				};
			}
			return {
				error: 'Unknown error occurred!'
			};
		}

		const { key } = await result.json();

		_this.locked = true;
		_this.key = key;
		const high = hljs.highlightAuto(data);

		return {
			error: null,
			value: high.value,
			key,
			language: high.language,
			lineCount: data.split('\n').length
		};
	}
}

// represents the paste application
class haste {
	constructor (appName, options) {
		this.appName = appName;
		this.$textarea = document.querySelector('textarea');
		this.$box = document.querySelector('#box');
		this.$code = document.querySelector('#box code');
		this.$linenos = document.querySelector('#linenos');
		this.options = options;
		this.configureShortcuts();
		this.configureButtons();
		this.baseUrl = options.baseUrl || '/';
	}

	// Set the page title - include the appName
	setTitle (ext) {
		document.title = `${this.appName}${ext ? ` - ${ext}` : ''}`;
	}

	// Show a message box
	showMessage (msg, cls, timeout) {
		const msgDiv = document.createElement('div');
		msgDiv.innerHTML = `<li class="${cls || 'info'}">${msg}</li>`;
		const messageArea = document.querySelector('#messages');
		messageArea.prepend(msgDiv);
		setTimeout(()=> {
			msgDiv.remove();
		}, timeout);
	}

	// Show the light key
	lightKey () {
		this.configureKey(['new', 'save']);
	}

	// Show the full key
	fullKey () {
		this.configureKey(['new', 'duplicate', 'raw']);
	}

	// Set the key up for certain things to be enabled
	configureKey (enable) {
		const buttonElements = document.querySelectorAll('#box2 .function');
		for (const button of buttonElements) {
			if (enable.some(el => button.classList.contains(el))) {
				button.classList.add('enabled');
			} else {
				button.classList.remove('enabled');
			}
		}
	}

	// Remove the current document (if there is one)
	// and set up for a new one
	newDocument (hideHistory) {
		this.$box.style.display = 'none';
		this.doc = new HasteDocument(this);
		if (!hideHistory) {
			window.history.pushState(null, this.appName, this.baseUrl);
		}
		this.setTitle();
		this.lightKey();
		this.$textarea.value = '';
		this.$textarea.style.display = 'block';
		this.$textarea.focus();
		this.removeLineNumbers();
	}

	// Look up the extension preferred for a type
	// If not found, return the type itself - which we'll place as the extension
	lookupExtensionByType (type) {
		for (const key in haste.extensionMap) {
			if (haste.extensionMap[key] === type) {
				return key;
			}
		}
		return type;
	}

	// Look up the type for a given extension
	// If not found, return the extension - which we'll attempt to use as the type
	lookupTypeByExtension (ext) {
		return haste.extensionMap[ext] || ext;
	}

	// Add line numbers to the document
	// For the specified number of lines
	addLineNumbers (lineCount) {
		let h = '';
		for (let i = 0; i < lineCount; i++) {
			h += `${(i + 1).toString()}<br/>`;
		}
		this.$linenos.innerHTML = h;
	}

	// Remove the line numbers
	removeLineNumbers () {
		this.$linenos.innerHTML = '&gt;';
	}

	// Load a document and show it
	async loadDocument (key) {
		// Split the key up
		const parts = key.split('.', 2);
		// Ask for what we want
		const _this = this;
		_this.doc = new HasteDocument(this);
		const document = await _this.doc.load(parts[0], parts[1]);
		if (document) {
			_this.$code.innerHTML = document.value;
			_this.setTitle(document.key);
			_this.fullKey();
			_this.$textarea.value = '';
			_this.$textarea.style.display = 'none';
			_this.$box.style.display = 'block';
			_this.$box.focus();
			_this.addLineNumbers(document.lineCount);
		} else {
			_this.newDocument();
		}
		this.lookupTypeByExtension(parts[1]);
	}
	// Duplicate the current document - only if locked
	duplicateDocument () {
		if (this.doc.locked) {
			const currentData = this.doc.data;
			this.newDocument();
			this.$textarea.value = currentData;
		}
	}

	// Lock the current document
	async lockDocument () {
		const _this = this;
		const saveDocument = await this.doc.save(this.$textarea.value);
		if (saveDocument.error) {
			return _this.showMessage(saveDocument.error, 'error', 5000);
		}
		_this.$code.innerHTML = saveDocument.value;
		_this.setTitle(saveDocument.key);
		const file = _this.baseUrl + saveDocument.key;
		/*         if (saveDocument.language) {
            file += `.${_this.lookupExtensionByType(saveDocument.language)}`;
        } */
		window.history.pushState(null, `${_this.appName}-${saveDocument.key}`, file);
		_this.fullKey();
		_this.$textarea.value = '';
		_this.$textarea.style.display = 'none';
		_this.$box.style.display = 'block';
		_this.$box.focus();
		_this.addLineNumbers(saveDocument.lineCount);
	}

	configureButtons () {
		const _this = this;
		this.buttons = [
			{
				location: document.querySelector('#box2 .save'),
				label: 'Save',
				shortcutDescription: 'control + s',
				shortcut: function (evt) {
					return evt.ctrlKey && (evt.keyCode === 83);
				},
				action: async function () {
					if (_this.$textarea.value.replace(/^\s+|\s+$/g, '') !== '') {
						await _this.lockDocument();
					}
				}
			},
			{
				location: document.querySelector('#box2 .new'),
				label: 'New',
				shortcut: function (evt) {
					return evt.ctrlKey && evt.keyCode === 78;
				},
				shortcutDescription: 'control + n',
				action: function () {
					_this.newDocument(!_this.doc.key);
				}
			},
			{
				location: document.querySelector('#box2 .duplicate'),
				label: 'Duplicate & Edit',
				shortcut: function (evt) {
					return _this.doc.locked && evt.ctrlKey && evt.keyCode === 68;
				},
				shortcutDescription: 'control + d',
				action: function () {
					_this.duplicateDocument();
				}
			},
			{
				location: document.querySelector('#box2 .raw'),
				label: 'Just Text',
				shortcut: function (evt) {
					return evt.ctrlKey && evt.shiftKey && evt.keyCode === 82;
				},
				shortcutDescription: 'control + shift + r',
				action: function () {
					if (!_this.doc.key) {
						return;
					}
					window.location.href = `${_this.baseUrl}raw/${_this.doc.key}`;
				}
			}
		];
		for (const button of this.buttons) {
			this.configureButton(button);
		}
	}

	configureButton (button) {
		// Click Action
		button.location.addEventListener('click', () => {
			if (button.location.classList.contains('enabled')) {
				button.action();
			}
		});
	}

	// Configure keyboard shortcuts for the textarea
	configureShortcuts () {
		this.$textarea.addEventListener('keydown', (evt) => {
			for (const button of this.buttons) {
				if (button.shortcut && button.shortcut(evt)) {
					evt.preventDefault();
					button.action();
				}
			}
		});
	}
}

// Map of common extensions
// Note: this list does not need to include anything that IS its extension,
// due to the behavior of lookupTypeByExtension and lookupExtensionByType
// Note: optimized for lookupTypeByExtension
haste.extensionMap = {
	sh: 'bash',
	clike: 'c-like',
	coffee: 'coffeescript',
	cs: 'csharp',
	dpr: 'delphi',
	erl: 'erlang',
	hs: 'haskell',
	js: 'javascript',
	kt: 'kotlin',
	tex: 'latex',
	lsp: 'lisp',
	mk: 'makefile',
	md: 'markdown',
	mm: 'objectivec',
	phptemp: 'php-template',
	pl: 'perl',
	txt: 'plaintext',
	py: 'python',
	pyrepl: 'python-repl',
	rb: 'ruby',
	rs: 'rust',
	sc: 'scala',
	sm: 'smalltalk',
	ts: 'typscript',
	vbs: 'vbscript',
	html: 'xml',
	htm: 'xml'
};

// Tab behavior in the textarea - 2 spaces per tab
// TODO: Refactor to vanilla JS and remove IE specific hacks. Investigate if a better way to implement exists.
/* $(()=> {
    $('textarea').keydown(function (evt) {
        if (evt.keyCode === 9) {
            evt.preventDefault();
            const myValue = '  ';
            // http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery
            // For browsers like Internet Explorer
            if (document.selection) {
                this.focus();
                const sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            } else if (this.selectionStart || this.selectionStart === '0') { // Mozilla and Webkit
                const startPos = this.selectionStart;
                const endPos = this.selectionEnd;
                const scrollTop = this.scrollTop;
                this.value = this.value.substring(0, startPos) + myValue
					+ this.value.substring(endPos,this.value.length);
                this.focus();
                this.selectionStart = startPos + myValue.length;
                this.selectionEnd = startPos + myValue.length;
                this.scrollTop = scrollTop;
            } else {
                this.value += myValue;
                this.focus();
            }
        }
    });
}); */
