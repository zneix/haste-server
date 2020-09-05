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


## Authors

Project continued by zneix <zzneix@gmail.com>

Original Code by John Crepezzi <john.crepezzi@gmail.com>


## Other components:

* jQuery: MIT/GPL license
* highlight.js: Copyright © 2006, Ivan Sagalaev
* highlightjs-coffeescript: WTFPL - Copyright © 2011, Dmytrii Nagirniak
