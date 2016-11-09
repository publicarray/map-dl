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
            console.log(file_name + ' downloaded to ' + output);
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
      -s, --scale   Scale in km
      -t, --type    Map Type: roadmap, satellite, terrain or hybrid
      -o, --output  file-path to save the files
      --apikey      Google Maps API key

    Example
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

// set default output folder
if (typeof cli.flags.output == 'undefined') {
    cli.flags.output = '.';
}

// get images as rectangles
var rectangles = mapDl(cli.input[0], cli.flags);

// create output folder
try {
    fs.mkdirSync(cli.flags.output.toString());
} catch (err) {
    if (err.code != 'EEXIST') {
        throw err;
    }
}

// save images
for (var i = rectangles.length - 1; i >= 0; i--) {
    downloadFile(rectangles[i].url, cli.flags.output, 'staticmap ('+i+').png');
}
