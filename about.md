# Haste

Sharing code is a good thing, and it should be _really_ easy to do.
A lot of times, I want to show you something I'm seeing - and that's where we
use pastebins.

Haste is the prettiest, easiest to use pastebin ever made.

## Basic Usage

Paste your code, click "Save" and copy the URL.
Send that URL to someone and they'll see your code.

To make a new entry, click "New" (or hit `Ctrl + N`)

## From the Console

Sometimes I want to show you some text from my current console session.  
We made it really easy to take code from the console and send it to people.

`cat something | haste` # https://hastebin.com/2107420

You can take this a step further and directly copy the URL with:

* osx: `cat something | haste | pbcopy`
* linux: `cat something | haste | xsel`
* windows: check out [WinHaste](https://github.com/ajryan/WinHaste)

After running that, URL to your paste will be copied to clipboard.

That's all there is to that, and you can install it with `gem install haste`
right now.
  * osx: you will need to have an up to date version of Xcode
  * linux: you will need to have rubygems and ruby-devel installed

## Duration

Pastes will not be removed, however I preseve all rights to make any exceptions.  
Contact me directly with any issues about documents uploaded at `zzneix@gmail.com`

## Privacy

While the contents of haste.zneix.eu are not crawled by any search robot that 
obeys "robots.txt", there should be no great expectation of privacy.  
Post things at your own risk. Not responsible for any removed pastes.

## Open Source

Haste can easily be installed behind your network, and it's all open source!

* [haste-client](https://github.com/seejohnrun/haste-client)
* [haste-server](https://github.com/zneix/haste-server)

## Authors

Project continued by zneix <zzneix@gmail.com>

Original Code by John Crepezzi <john.crepezzi@gmail.com>
Key Design by Brian Dawson <bridawson@gmail.com>
