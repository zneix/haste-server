module.exports = {
    "host": "127.0.0.1",
    "port": 4200,

    "keyLength": 10,
    "maxLength": 400000,

    "staticMaxAge": 60 * 60 * 24,

    "recompressStaticAssets": true,

    "logging": [], //re-add this feature later

    "keyGenerator": {
        "type": "phonetic"
    },

    "rateLimits": {
        "windowMs": 60 * 60 * 1000,
        "max": 500
    },

    "storage": {
        "type": "file",
        "path": "./data"
    },
    
    "documents": {
        "about": "./about.md"
    }
}