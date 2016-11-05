'use strict';

var fs = require('fs');
// var url = require('url');
// var http = require('http');
var https = require('https');
var exec = require('child_process').exec;
// var spawn = require('child_process').spawn;

function toRadians(num) {
    var pi = Math.PI;
    return (num)*(pi/180);
}

// http://www.movable-type.co.uk/scripts/latlong.html
function computeDistanceBetween(point1, point2) {
    var R = 6371e3; // Earth's radius in metres
    var φ1 = toRadians(point1.lat);
    var φ2 = toRadians(point2.lat);
    var Δφ = toRadians((point2.lat-point1.lat));
    var Δλ = toRadians((point2.lng-point1.lng));

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function getRectangles(bounds, scale, array, maptype, apikey) {
    var NE = {lat:bounds.north, lng:bounds.east};
    var SW = {lat:bounds.south, lng:bounds.west};
    var NW = {lat:bounds.north, lng:bounds.west};
    var SE = {lat:bounds.south, lng:bounds.east};

    console.log('NE', NE);
    console.log('SW', SW);
    console.log('NW', NW);
    console.log('SE', SE);

    var height = computeDistanceBetween(NW, SW) / scale; // in km
    var width = computeDistanceBetween(NW, NE) / scale; // in km
    console.log('height', height);
    console.log('width', width);

    var totalHeight = bounds.north - bounds.south; // in lat
    var totalWidth = bounds.east - bounds.west; // in long
    console.log('totalHeight', totalHeight);
    console.log('totalWidth', totalWidth);
    // var addheight = totalHeight/height; // cache value to add by
    // var addwidth = totalWidth/width; // cache value to add by


    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {

            var north = ((totalHeight / height) * i);
            var east = ((totalWidth / width) * j);
            var south = ((totalHeight / height) * (i + 1));
            var west = ((totalWidth / width) * (j + 1));


            if (north < 0) {
                north = bounds.north + north;
            } else {
                north = bounds.north - north;
            }

            if (south < 0) {
                south = bounds.north + south;
            } else {
                south = bounds.north - south;
            }

            if (east < 0) {
                east = bounds.east + east;
            } else {
                east = bounds.east - east;
            }

            if (west < 0) {
                west = bounds.east + west;
            } else {
                west = bounds.east - west;
            }

            var rectangle = {
                north: north,
                east: east,
                south: south,
                west: west,
                center: {
                    lat: (north+south)/2,
                    lng: (east+west)/2,
                    toUrlValue: function toUrlValue () {
                        return Number(this.lat).toFixed(6) + ',' + Number(this.lng).toFixed(6);
                    }
                },
                getNorthEast: function getNorthEast () {
                    return {lat: north, lng: east};
                },
                getSouthWest: function getSouthWest () {
                    return {lat: south, lng: west};
                }

            };
            // rectangle.center.toUrlValue
            console.log(rectangle);
            console.log(rectangle.center.toUrlValue());
            array.push(rectangle);
            __getURL(rectangle, maptype, apikey, function (url) {
                console.log(url);
            });
        }
    }
}

// https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds#13274361
function getBoundsZoomLevel(bounds, mapDim) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

    var lngDiff = ne.lng - sw.lng;
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

function __getURL(rectangle, maptype, apikey, callback) {
    var size = {height: 640, width: 640}; // max = 640 or 800
    var zoom = getBoundsZoomLevel(rectangle, size)

    var position = rectangle.center;
    // // maxZoomService.getMaxZoomAtLatLng(position, function (response) {
    //     if (response.status !== 'OK') {
    //         console.error("Error contacting MaxZoomService", response.status);
    //     } else {
    //         if (response.zoom < zoom) {
    //             console.warn("Sorry, but the max zoom for this region is: " + response.zoom + ". changed from: ", zoom);
    //             zoom = response.zoom;
    //         }
    //     }
    rectangle.url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + position.toUrlValue() +
            '&zoom=' + zoom +
            '&format=png&maptype=' + maptype +
            '&size='+size.height+'x'+size.width+'&scale=2' +
            '&key=' + apikey;
    callback(rectangle.url);
    // });
}

// Function to download file using HTTP.get
var downloadFile = function(file_url, output, fileName) {
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
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        console.error(err.message);
    });
};

function init(boundaries, flags) {
    var boundariesArr = boundaries.split(',');
    console.log(boundaries);
    console.log(flags);

    if (boundaries[0].charAt(0) == '[') {
        boundariesArr = JSON.parse(boundaries);
    }
    console.log(boundariesArr);
    if (boundariesArr.length != 4) {
        console.error("Invalid number of arguments. Got " + boundariesArr.length + " expected 4:", boundaries);
        return 1;
    }

    var bounds = {
        north: boundariesArr[0],
        east: boundariesArr[1],
        south: boundariesArr[2],
        west: boundariesArr[3],
    }

    const scale = flags.scale * 1000 || 10 * 1000;
    const maptype = flags.maptype || 'hybrid';
    const apikey = flags.apikey || 'AIzaSyDLGb2-Qs3xFIx2TYQ7yKYLTypgo3TGcoY';
    console.log(scale);

    var rectangles = [];
    getRectangles(bounds, scale, rectangles, maptype, apikey)
    // var mapBounds = new googleMapsClient.maps.LatLngBounds({lat:-27.883, lng:153.284}, {lat:-27.988, lng:153.51})

    // const maxZoomService = new google.maps.MaxZoomService();
    // googleMapsClient.load(function(google) {
    //     maxZoomService = new google.maps.MaxZoomService()
    // });




    // if (sizeValue == NaN || sizeValue == Infinity || sizeValue <= 0) {
    //     console.error("Error: size is not a valid number!", sizeValue);
    //     return;
    // }

    var output = flags.output || '.';

    var mkdir = 'mkdir -p ' + output;
    var child = exec(mkdir, function(err, stdout, stderr) {
        if (err) {
            // throw err;
            return;
        }
    });

    for (var i = rectangles.length - 1; i >= 0; i--) {
        downloadFile(rectangles[i].url, output, 'staticmap ('+i+').png');
    }



}

// init('[-27.883,153.531,-27.994,153.284]', {scale:5});
module.exports = init;
