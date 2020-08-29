# Storage

Here's a list of all supported document store systems.  
One of these is meant to be set in `config.json` as `storage` object.  
Default type is [file](#file) with save directory at `./data`.  
With some storage options you can set up document expiration - after which documents will no longer be available

**Table of Contents**

In alphabetical order:

- [Amazon S3](#amazon-s3)
- [File](#file)
- [Memcached](#memcached)
- [MongoDB](#mongodb)
- [Postgres](#postgres)
- [Redis](#redis)
- [RethinkDB](#rethinkdb)


## Amazon S3

Not rewritten yet, to be filled in


## File

Default storage option, with no further installation required.  
Stores documents in a specified directory in files named with a md5 hash of the key to avoid any security issues.  
Default path is `./data`  
> **NOTE:** File storage option does not support document expiration!

Config:

```json
{
	"type": "file",
	"path": "./data"
}
```


## Memcached

Not rewritten yet, to be filled in


## MongoDB

Requires npm package (Tested on v3.6.0):

```bash
npm i mongodb@3.6.0
```

Stores documents in a specified database in a collection named `entries`.  
Expiration property in config can be changed to a value in seconds after which entries will not be served to users.

Optimal default config:  
> **NOTE:** Depending on how your MongoDB server is configured, options as connectionUri may vary.  
If server has no authentication, you can omit the `auth` object.  

Check [documentation](http://mongodb.github.io/node-mongodb-native/3.5/api/MongoClient.html) for more detailed explanation about available `clientOptions` properties.

```json
{
	"type": "mongodb",
	"expire": 0,
	"connectionUri": "mongodb://localhost:27017/haste",
	"clientOptions": {
		"useUnifiedTopology": true,
		"useNewUrlParser": true,
		"keepAlive": true,
		"keepAliveInitialDelay": 60000,
		"poolSize": 30,
		"socketTimeoutMS": 360000,
		"connectTimeoutMS": 360000,
		"auth": {
				"user": "username",
				"password": "password"
		},
		"authSource": "admin"
	}
}
```


## Postgres

Not rewritten yet, to be filled in


## Redis

Not rewritten yet, to be filled in


## RethinkDB

Not rewritten yet, to be filled in
