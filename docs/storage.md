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
- [Amazon DynamoDB](#amazon-dynamodb)
- [Cloudant](#cloudant)


## Amazon S3

Stores documents in a specified s3 storage bucket.
To use S3 compatible object storage, you must install `@aws-sdk/client-s3` via `npm` or `yarn`

The bucket must be pre-create before running the server.
Check [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html) for more `S3ClientConfig` options.

```json
{
  "type": "amazon-s3",
  "bucket": "bucketname",
  "expire": 0,
  "clientOptions": {
    "region": "region-code",
    "credentials": {
      "accessKeyId": "access key id here",
      "secretAccessKey": "super secret access key here"
    },
    // For custom endpoint or S3 compatible storage 
    // like Minio, DigitalOcean Spaces, IBM Cloud Object Storage, Backblaze B2 cloud storage...
    "endpoint": "https://custom.s3.endpoint",
    // For Minio to work
    "forcePathStyle": true
  }
}
```


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

Stores documents in a specified database in a collection named `entries`.  
Expiration property in config can be changed to a value in seconds after which entries will not be served.

Optimal default config:  
> **NOTE:** Depending on how your MongoDB server is configured, options as connectionUri may vary.  
If server has no authentication, you can omit the `auth` object.  

Check [documentation](https://mongodb.github.io/node-mongodb-native/3.5/api/MongoClient.html) for more detailed explanation about available `clientOptions` properties.

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

You will have to create the database and add a table named `entries`. It can be easily done with the following query:  

`CREATE TABLE entries (id SERIAL PRIMARY KEY, key VARCHAR(255) NOT NULL, value TEXT NOT NULL, expiration INT, UNIQUE(key));`

Properties in `clientOptions` are optimal defaults and should be sufficient to run haste, however more detailed explanation for them can be found in pg package [documentation](https://node-postgres.com/api/client).  
Expiration property in config can be changed to a value in seconds after which entries will not be served.

```json
{
	"type": "postgres",
	"expire": 0,
	"clientOptions": {
		"host": "localhost",
		"port": 5432,
		"user": "username",
		"password": "password",
		"database": "haste"
	}
}
```

## Redis

Stores documents in a specified redis database.  
Expiration property in config can be changed to a value in seconds after which entries will not be served.

`redisOptions` object below contains default values, but you can adjust those to match your redis-server configuration. Check [documentation](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) for more information about accepted values.

```json
{
	"type": "redis",
	"expire": 0,
	"redisOptions": {
		"host": "127.0.0.1",
		"port": 6379,
		"db": 1
	}
}
```

## RethinkDB

To use the RethinkDB storage system, you must install the `rethinkdbdash` package via `npm` or `yarn`

Create a database and a table with with your preferred name, which will store all data.
Replace `dbname` and `tablename` in config object below with the real name of database and table respectively.
Check [documentation](https://github.com/neumino/rethinkdbdash#new-features-and-differences) for more config options.

```json
{
  "type": "rethinkdb",
  "table": "tablename",
  "expire": 0,
  "clientOptions": {
    "host": "127.0.0.1",
    "port": 28015,
    "db": "dbname"
  }
}
```

## Amazon DynamoDB

To use Amazon DynamoDB store, you must install `@aws-sdk/client-dynamodb` via `npm` or `yarn`

The table must be pre-create before running the server.
Check [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/dynamodbclientconfig.html) for more `DynamoDBClientConfig` options.

```json
{
  "type": "amazon-dynamodb",
  "table": "tablename",
  "expire": 0,
  "clientOptions": {
    "region": "region-code",
    "credentials": {
      "accessKeyId": "access key id here",
      "secretAccessKey": "super secret access key here"
    }
  }
}
```

## Cloudant

To use S3 compatible object storage, you must install `@cloudant/cloudant` via `npm` or `yarn`

Before start server, create a database with your preffered name.
Check [documentation](https://github.com/cloudant/nodejs-cloudant/blob/master/README.md) for more detailed configuration.

```json
{
  "type": "cloudant",
  "db": "dbname",
  "expire": 0,
  "clientOptions": {
    "url": "https://your.cloudant.service",
    // If you use username and password for authentication
    "username": "username",
    "password": "password",
    // If you use IBM Cloud's IAM API Key for authentication
    "plugins": {
      "iamauth": {
        "iamApiKey": "your iam api key here"
      }
    }
  }
}

```