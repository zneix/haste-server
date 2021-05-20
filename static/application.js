/* global $, hljs, window, document */
///// represents a single document
class haste_document {
	constructor(app){
		this.locked = false;
		this.app = app;
	}
	// Escapes HTML tag characters
	htmlEscape(s){
		return s
			.replace(/&/g, '&amp;')
			.replace(/>/g, '&gt;')
			.replace(/</g, '&lt;')
			.replace(/"/g, '&quot;');
	}
	// Get this document from the server and lock it here
	load(key, callback, lang){
		let _this = this;
		$.ajax(`${_this.app.baseUrl}documents/${key}`, {
			type: 'get',
			dataType: 'json',
			success: function (res){
				_this.locked = true;
				_this.key = key;
				_this.data = res.data;
				let high;
				try {
					if (lang == 'txt'){
						high = { value: _this.htmlEscape(res.data) };
					}
					else if (lang){
						high = hljs.highlight(res.data, {language: lang});
					}
					else {
						high = hljs.highlightAuto(res.data);
					}
				}
				catch (err){
					// failed highlight, fall back on auto
					high = hljs.highlightAuto(res.data);
				}
				callback({
					value: high.value,
					key: key,
					language: high.language || lang,
					lineCount: res.data.split('\n').length
				});
			},
			error: function (){
				callback(false);
			}
		});
	}
	// Save this document to the server and lock it here
	save(data, callback){
		if (this.locked)
			return false;
		this.data = data;
		let _this = this;
		$.ajax(`${_this.app.baseUrl}documents`, {
			type: 'post',
			data: data,
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			success: function (res){
				_this.locked = true;
				_this.key = res.key;
				let high = hljs.highlightAuto(data);
				callback(null, {
					value: high.value,
					key: res.key,
					language: high.language,
					lineCount: data.split('\n').length
				});
			},
			error: function (res){
				try {
					callback($.parseJSON(res.responseText));
				}
				catch (e){
					callback({ message: 'Something went wrong!' });
				}
			}
		});
	}
}

///// represents the paste application
class haste {
	constructor(appName, options){
		this.appName = appName;
		this.$textarea = $('textarea');
		this.$box = $('#box');
		this.$code = $('#box code');
		this.$linenos = $('#linenos');
		this.options = options;
		this.configureShortcuts();
		this.configureButtons();
		// If twitter is disabled, hide the button
		if (!options.twitter) $('#box2 .twitter').hide();
		this.baseUrl = options.baseUrl || '/';
	}
	// Set the page title - include the appName
	setTitle(ext){
		document.title = `${this.appName}${ext ? ` - ${ext}` : ''}`;
	}
	// Show a message box
	showMessage(msg, cls){
		let msgBox = $(`<li class="${cls || 'info'}">${msg}</li>`);
		$('#messages').prepend(msgBox);
		setTimeout(function (){
			msgBox.slideUp('fast', function (){ $(this).remove(); });
		}, 3000);
	}
	// Show the light key
	lightKey(){
		this.configureKey(['new', 'save']);
	}
	// Show the full key
	fullKey(){
		this.configureKey(['new', 'duplicate', 'twitter', 'raw']);
	}
	// Set the key up for certain things to be enabled
	configureKey(enable){
		let $this;
		$('#box2 .function').each(function (){
			$this = $(this);
			for (const el of enable){
				if ($this.hasClass(el)){
					$this.addClass('enabled');
					return true;
				}
			}
			$this.removeClass('enabled');
		});
	}
	// Remove the current document (if there is one)
	// and set up for a new one
	newDocument(hideHistory){
		this.$box.hide();
		this.doc = new haste_document(this);
		if (!hideHistory){
			window.history.pushState(null, this.appName, this.baseUrl);
		}
		this.setTitle();
		this.lightKey();
		this.$textarea.val('').show('fast', function (){
			this.focus();
		});
		this.removeLineNumbers();
	}
	// Look up the extension preferred for a type
	// If not found, return the type itself - which we'll place as the extension
	lookupExtensionByType(type){
		for (let key in haste.extensionMap){
			if (haste.extensionMap[key] == type)
				return key;
		}
		return type;
	}
	// Look up the type for a given extension
	// If not found, return the extension - which we'll attempt to use as the type
	lookupTypeByExtension(ext){
		return haste.extensionMap[ext] || ext;
	}
	// Add line numbers to the document
	// For the specified number of lines
	addLineNumbers(lineCount){
		let h = '';
		for (let i = 0; i < lineCount; i++){
			h += (i + 1).toString() + '<br/>';
		}
		$('#linenos').html(h);
	}
	// Remove the line numbers
	removeLineNumbers(){
		$('#linenos').html('&gt;');
	}
	// Load a document and show it
	loadDocument(key){
		// Split the key up
		let parts = key.split('.', 2);
		// Ask for what we want
		let _this = this;
		_this.doc = new haste_document(this);
		_this.doc.load(parts[0], function (ret){
			if (ret){
				_this.$code.html(ret.value);
				_this.setTitle(ret.key);
				_this.fullKey();
				_this.$textarea.val('').hide();
				_this.$box.show().focus();
				_this.addLineNumbers(ret.lineCount);
			}
			else {
				_this.newDocument();
			}
		}, this.lookupTypeByExtension(parts[1]));
	}
	// Duplicate the current document - only if locked
	duplicateDocument(){
		if (this.doc.locked){
			let currentData = this.doc.data;
			this.newDocument();
			this.$textarea.val(currentData);
		}
	}
	// Lock the current document
	lockDocument(){
		let _this = this;
		this.doc.save(this.$textarea.val(), function (err, ret){
			if (err){
				_this.showMessage(err.message, 'error');
			}
			else if (ret){
				_this.$code.html(ret.value);
				_this.setTitle(ret.key);
				let file = _this.baseUrl + ret.key;
				if (ret.language){
					file += `.${_this.lookupExtensionByType(ret.language)}`;
				}
				window.history.pushState(null, `${_this.appName}-${ret.key}`, file);
				_this.fullKey();
				_this.$textarea.val('').hide();
				_this.$box.show().focus();
				_this.addLineNumbers(ret.lineCount);
			}
		});
	}
	configureButtons(){
		let _this = this;
		this.buttons = [
			{
				$where: $('#box2 .save'),
				label: 'Save',
				shortcutDescription: 'control + s',
				shortcut: function (evt){
					return evt.ctrlKey && (evt.keyCode == 83);
				},
				action: function (){
					if (_this.$textarea.val().replace(/^\s+|\s+$/g, '') != ''){
						_this.lockDocument();
					}
				}
			},
			{
				$where: $('#box2 .new'),
				label: 'New',
				shortcut: function (evt){
					return evt.ctrlKey && evt.keyCode == 78;
				},
				shortcutDescription: 'control + n',
				action: function (){
					_this.newDocument(!_this.doc.key);
				}
			},
			{
				$where: $('#box2 .duplicate'),
				label: 'Duplicate & Edit',
				shortcut: function (evt){
					return _this.doc.locked && evt.ctrlKey && evt.keyCode == 68;
				},
				shortcutDescription: 'control + d',
				action: function (){
					_this.duplicateDocument();
				}
			},
			{
				$where: $('#box2 .raw'),
				label: 'Just Text',
				shortcut: function (evt){
					return evt.ctrlKey && evt.shiftKey && evt.keyCode == 82;
				},
				shortcutDescription: 'control + shift + r',
				action: function (){
					window.location.href = `${_this.baseUrl}raw/${_this.doc.key}`;
				}
			},
			{
				$where: $('#box2 .twitter'),
				label: 'Twitter',
				shortcut: function (evt){
					return _this.options.twitter && _this.doc.locked && evt.shiftKey && evt.ctrlKey && evt.keyCode == 84;
				},
				shortcutDescription: 'control + shift + t',
				action: function (){
					window.open(`https://twitter.com/share?url=${encodeURI(window.location.href)}`);
				}
			}
		];
		for (const button of this.buttons){
			this.configureButton(button);
		}
	}
	configureButton(options){
		// Handle the click action
		options.$where.click(function (evt){
			evt.preventDefault();
			if (!options.clickDisabled && $(this).hasClass('enabled')){
				options.action();
			}
		});
		// Show the label
		options.$where.mouseenter(function (){
			$('#box3 .label').text(options.label);
			$('#box3 .shortcut').text(options.shortcutDescription || '');
			$('#box3').show();
			$(this).append($('#pointer').remove().show());
		});
		// Hide the label
		options.$where.mouseleave(function (){
			$('#box3').hide();
			$('#pointer').hide();
		});
	}
	// Configure keyboard shortcuts for the textarea
	configureShortcuts(){
		let _this = this;
		$(document.body).keydown(function (evt){
			for (const button of _this.buttons){
				if (button.shortcut && button.shortcut(evt)){
					evt.preventDefault();
					button.action();
					return;
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
	sh: 'bash', clike: 'c-like', coffee: 'coffeescript', cs: 'csharp', dpr: 'delphi',
	erl: 'erlang', hs: 'haskell', js: 'javascript', kt: 'kotlin', tex: 'latex',
	lsp: 'lisp', mk: 'makefile', md: 'markdown', mm: 'objectivec', phptemp: 'php-template',
	pl: 'perl',	txt: 'plaintext', py: 'python', pyrepl: 'python-repl', rb: 'ruby', rs: 'rust',
	sc: 'scala', sm: 'smalltalk', ts: 'typscript', vbs: 'vbscript', html: 'xml', htm: 'xml',
};

///// Tab behavior in the textarea - 2 spaces per tab
$(function(){
	$('textarea').keydown(function(evt){
		if (evt.keyCode == 9){
			evt.preventDefault();
			let myValue = '  ';
			// http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery
			// For browsers like Internet Explorer
			if (document.selection){
				this.focus();
				let sel = document.selection.createRange();
				sel.text = myValue;
				this.focus();
			}
			// Mozilla and Webkit
			else if (this.selectionStart || this.selectionStart == '0'){
				let startPos = this.selectionStart;
				let endPos = this.selectionEnd;
				let scrollTop = this.scrollTop;
				this.value = this.value.substring(0, startPos) + myValue +
					this.value.substring(endPos,this.value.length);
				this.focus();
				this.selectionStart = startPos + myValue.length;
				this.selectionEnd = startPos + myValue.length;
				this.scrollTop = scrollTop;
			}
			else {
				this.value += myValue;
				this.focus();
			}
		}
	});
});
