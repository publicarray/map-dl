#!/usr/bin/env node
'use strict';
const meow = require('meow');
const mapDl = require('./index.js');

const cli = meow(`
    Usage
      $ map-dl <North, East, South, West>

    Options
      -s, --scale  Scale in km
      -t, --type   Map Type -> https://developers.google.com/maps/documentation/static-maps/intro#MapTypes
      -o, --output filepath to save the files
      --apikey  Google Maps API key
    Examples
      $ map-dl "[-27.883,153.531,-27.994,153.284]" -s5
`, {
    alias: {
        s: 'scale',
        t: 'type',
        o: 'output'
    }
});

if (cli.input.length != 1) {
    cli.showHelp(0);
}

mapDl(cli.input[0], cli.flags);
