# DISCLAIMER

This is a continued version of hastebin server with extended development, developed alone by zneix.  
Original developer abandoned this amazing project and due to pile of unmerged Pull Requests and several security issues with outdated dependencies I decided to rewrite whole project in JavaScript ES6.  

**This version is heavily changed, meaning there will be breaking changes in your config if you were running outdated upstream version.**

# Haste

Haste is an open-source pastebin software written in Node.JS, which is easily installable in any network.  
It can be backed by either redis or filesystem and has a very easy adapter interface for other storage systems.  
A publicly available version can be found at [haste.zneix.eu](https://haste.zneix.eu)

Major design objectives:

* Be really pretty
* Be really simple
* Be easy to set up and use

I also rewrote Command Line utility [haste-client](https://github.com/zneix/haste-client), which can do things like:

`cat file | haste`

it outputs URL to a paste containing contents of `file`. Check [repo](https://github.com/zneix/haste-client) for more details.


# Installation

Full installation and config instructions can be found in [`docs` directory](https://github.com/zneix/haste-server/tree/master/docs).


## Docker

### Build image

```bash
docker build --tag haste-server .
```

### Run container

For this example we will run haste-server, and connect it to a redis server

```bash
docker run --name haste-server-container --env STORAGE_TYPE=redis --env STORAGE_HOST=redis-server --env STORAGE_PORT=6379 haste-server
```

### Use docker-compose example

There is an example `docker-compose.yml` which runs haste-server together with memcached

```bash
docker-compose up
```

### Configuration

The docker image is configured using environmental variables as you can see in the example above.

Here is a list of all the environment variables

### Storage

|          Name          | Default value |                                                  Description                                                  |
| :--------------------: | :-----------: | :-----------------------------------------------------------------------------------------------------------: |
|      STORAGE_TYPE      |   memcached   |    Type of storage . Accepted values: "memcached","redis","postgres","rethinkdb", "amazon-s3", and "file"     |
|      STORAGE_HOST      |   127.0.0.1   |                 Storage host. Applicable for types: memcached, redis, postgres, and rethinkdb                 |
|      STORAGE_PORT      |     11211     |           Port on the storage host. Applicable for types: memcached, redis, postgres, and rethinkdb           |
| STORAGE_EXPIRE_SECONDS |    2592000    | Number of seconds to expire keys in. Applicable for types. Redis, postgres, memcached. `expire` option to the |
|       STORAGE_DB       |       2       |                    The name of the database. Applicable for redis, postgres, and rethinkdb                    |
|    STORAGE_PASSWORD    |               |                       Password for database. Applicable for redis, postges, rethinkdb .                       |
|    STORAGE_USERNAME    |               |                           Database username. Applicable for postgres, and rethinkdb                           |
|   STORAGE_AWS_BUCKET   |               |                          Applicable for amazon-s3. This is the name of the S3 bucket                          |
|   STORAGE_AWS_REGION   |               |                      Applicable for amazon-s3. The region in which the bucket is located                      |
|    STORAGE_FILEPATH    |               |                            Path to file to save data to. Applicable for type file                             |

### Logging

|       Name        | Default value | Description |
| :---------------: | :-----------: | :---------: |
|   LOGGING_LEVEL   |    verbose    |             |
|   LOGGING_TYPE=   |    Console    |
| LOGGING_COLORIZE= |     true      |

### Basics

|           Name           |  Default value   |                                        Description                                        |
| :----------------------: | :--------------: | :---------------------------------------------------------------------------------------: |
|           HOST           |     0.0.0.0      |                         The hostname which the server answers on                          |
|           PORT           |       7777       |                          The port on which the server is running                          |
|        KEY_LENGTH        |        10        |                              the length of the keys to user                               |
|        MAX_LENGTH        |      400000      |                                 maximum length of a paste                                 |
|      STATIC_MAX_AGE      |      86400       |                                 max age for static assets                                 |
| RECOMPRESS_STATIC_ASSETS |       true       |                        whether or not to compile static js assets                         |
|    KEYGENERATOR_TYPE     |     phonetic     |             Type of key generator. Acceptable values: "phonetic", or "random"             |
|  KEYGENERATOR_KEYSPACE   |                  |                  keySpace argument is a string of acceptable characters                   |
|        DOCUMENTS         | about=./about.md | Comma separated list of static documents to serve. ex: \n about=./about.md,home=./home.md |

### Rate limits

|                 Name                 |             Default value             |                                       Description                                        |
| :----------------------------------: | :-----------------------------------: | :--------------------------------------------------------------------------------------: |
|   RATELIMITS_NORMAL_TOTAL_REQUESTS   |                  500                  | By default anyone uncategorized will be subject to 500 requests in the defined timespan. |
| RATELIMITS_NORMAL_EVERY_MILLISECONDS |                 60000                 |             The timespan to allow the total requests for uncategorized users             |
| RATELIMITS_WHITELIST_TOTAL_REQUESTS  |                                       |      By default client names in the whitelist will not have their requests limited.      |
|  RATELIMITS_WHITELIST_EVERY_SECONDS  |                                       |      By default client names in the whitelist will not have their requests limited.      |
|         RATELIMITS_WHITELIST         | example1.whitelist,example2.whitelist |           Comma separated list of the clients which are in the whitelist pool            |
| RATELIMITS_BLACKLIST_TOTAL_REQUESTS  |                                       |    By default client names in the blacklist will be subject to 0 requests per hours.     |
|  RATELIMITS_BLACKLIST_EVERY_SECONDS  |                                       |     By default client names in the blacklist will be subject to 0 requests per hours     |
|         RATELIMITS_BLACKLIST         | example1.blacklist,example2.blacklist |           Comma separated list of the clients which are in the blacklistpool.            |

## Authors

Project continued by zneix <zzneix@gmail.com>

Docker Support by [Toa](https://toaaa.de)

Original Code by John Crepezzi <john.crepezzi@gmail.com>


## Other components:

* jQuery: MIT/GPL license
* highlight.js: Copyright © 2006, Ivan Sagalaev
* highlightjs-coffeescript: WTFPL - Copyright © 2011, Dmytrii Nagirniak
