# Short instructions

1. Install [node](https://nodejs.org/en/) and npm packages.
2. Copy `config/default.js` to `config/development.js` or edit `production.js` depending on your NODE_ENV. (Defaults are enough)
3. (Optional) Change document storage system ([guide](./storage.md))
4. Run with `npm start` or `node .`

# Heroku Ready
Haste Server contains a Heroku-Ready default configuration named `production.js` that respects `process.env.PORT`

# Full installation instructions

> **NOTE:** This guide assumes you're on a Linux server, like Debian 10 or Ubuntu 20.04.  
If you're using windows, you will have to improvise a bit with Autorestarts.

**Table of Contents**

- [Set up node](#set-up-node)
- [Install dependencies](#install-dependencies)
- [Edit configuration](#edit-configuration)
- [Run the server](#run-the-server)
- [Further steps](#further-steps)


## Set up node

Hastebin server runs on the JavaScript runtime called node, so you need to download it first:

```bash
curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
```

If method above didn't work [use this guide](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions).

For Windows enviroments, you can [download and install node from its website](https://nodejs.org/en/download/current/).  

Node should also automatically install [npm](https://docs.npmjs.com/about-npm/) which will help us install dependencies. You can verify your installations, with following commands

```bash
node -v
npm -v
```


## Install dependencies

Hastebin makes use of several node packages, which can be installed with npm by executing this command:

```bash
npm install
```


## Edit configuration

There is an [example configuration file](../example.config.json) available for you to copy:

```bash
cp example.config.json config.json
```

By default storage system stores haste documents as hashed files in `./data` directory.  

Rest of provided defaults are enough to run the server, however, example config contains comments about what each value does and you can adjust the options to your likings.

[Guide for all supported storage systems.](./storage.md).  
[Guide for all supported key generators.](./generators.md).  


## Run the server

You should now be able to start the server with the following command:

```bash
npm run-script start
```

To stop server the server, hit `Ctrl + C`

## Further steps

Once you're good to go and server is running you probably want to keep it alive 24/7 - to achieve that you can choose from variety of things like: pm2, systemd, screen, etc.  
Here, I will cover a basic guide to the PM2 - a program which will make sure your server is running 24/7 with autorestarts.

Download it with npm:

```bash
sudo npm install pm2 -g
```

Now assign Hastebin server to pm2's daemon:

```bash
pm2 start "npm start" --name=haste
```

To ensure haste server will automatically start after server reboot you need to retrieve startup script and execute it.  
Example:

```bash
$ pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u zneix --hp /home/zneix
```

Now, just copy-paste the last line into your terminal and you should be done.



PM2 Commands:

- `pm2 list`: displays list of all pm2 processes
- `pm2 logs haste`: displays server logs

- `pm2 restart haste`: restarts Hastebin server (you will need to do that after config changes, etc.)
- `pm2 stop haste`: stops Hastebin server
- `pm2 start haste`: starts Hastebin server if it was stopped manually before