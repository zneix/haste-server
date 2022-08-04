module.exports = {
    //address and port to which server will bind, host can also be a hostname
    "host": "127.0.0.1",
    "port": 7777,

    //length of random characters in link that's generated on document save
    "keyLength": 10,
    
    //max allowed paste length - 0 for unlimited
    "maxLength": 400000,

    //algorithm used to generate random characters
    //see docs/generators.md for more information
    "keyGenerator": {
        "type": "phonetic"
    },

    //TODO: re-add more options to logging
    //logging preferences
    "logging": {
        // can be one of: info, warn, error, fatal, debug, trace, silent
        "level": "debug"
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