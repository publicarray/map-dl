#!/usr/bin/env node
'use strict';
const fs = require('fs');
const meow = require('meow');
const https = require('https');
const mapDl = require('../map-dl.js');

// Function to download file using HTTP.get
const downloadFile = function(file_url, output, fileName) {
    var file_name = fileName || url.parse(file_url).pathname.split('/').pop();
    var file = fs.createWriteStream(output + '/' + file_name);
// Todo: check if path exists
    https.get(file_url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            console.log(file_name + ' downloaded to ' + output + file_name);
        });
    }).on('error', function(err) {
        fs.unlink(dest); // Delete the file on error
        console.error(err.message);
    });
};

const cli = meow(`
    Usage
      $ map-dl [North, East, South, West]

    Options
      -s, --scale    Scale in km
      -t, --type     Map Type: roadmap, satellite, terrain or hybrid
      -o, --output   File-path to save the files
      -k, --apikey   Google Maps API key
      -v, --verbose  Verbose logging

    Example
      $ map-dl "[-27.883,153.531,-27.994,153.284]" --scale 5 --output ~/Desktop/map
`, {
    alias: {
        s: 'scale',
        t: 'type',
        o: 'output',
        k: 'apikey',
        v: 'verbose'
    }
});

if (cli.input.length != 1) {
    cli.showHelp(0);
}

// set default output folder
if (typeof cli.flags.output == 'undefined') {
    cli.flags.output = '.';
}

// create output folder
try {
    fs.mkdirSync(cli.flags.output.toString());
} catch (err) {
    if (err.code != 'EEXIST') {
        throw err;
    }
}

// get images as and download them
mapDl({
    boundaries: cli.input[0],
    scale: cli.flags.scale,
    maptype: cli.flags.type,
    apikey: cli.flags.apikey,
    verbose: cli.flags.verbose,
    callback: function (rectangle, total) {
        downloadFile(rectangle.url, cli.flags.output, 'staticmap '+rectangle.x+' '+rectangle.y+'.png');
    },
});
