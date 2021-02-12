module.exports = {
	//address and port to which server will bind, host can also be a hostname
	//by default it will listen on all ipv4 and ipv6 addresses on port 7777
	//"host": "127.0.0.1",
	//"port": 7777,

	//length of random characters in link that's generated on document save
	"keyLength": 10,
	//max allowed paste length - 0 for unlimited
	"maxLength": 400000,

	//algorithm used to generate random characters
	//see docs/generators.md for more information
	"keyGenerator": {
		"type": "phonetic"
	},

	//max age for static website assets
	"staticMaxAge": 60 * 60 * 24,

	//TODO: re-add more options to logging
	//logging preferences
	"logging": {
		//can be one of: error, warn, info, http, verbose, debug, silly
		"level": "info"
	},

	//rate limits for requests, can be omitted
	//handled by express-rate-limit, options can be found here: https://github.com/nfriedly/express-rate-limit/blob/master/lib/express-rate-limit.js#L7-L14
	"rateLimits": {
		"windowMs": 30 * 60 * 1000,
		"max": 250
	},

	//storage system used for storing saved haste documents
	//see docs/storage.md for more information
	"storage": {
		"type": "file",
		"path": "./data"
	},

	//static documents that will never expire ("name": "path")
	"documents": {
		"about": "./about.md"
	}
};