'use strict';
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

// function drawRects2() {
//         sizeValue = document.getElementById('scaleInput').value * 1000 // 1000 = 1 per km
//         var bounds = map.getBounds();
//         var boundsJ = bounds.toJSON();
//         // console.log(boundsJ);
//         var NE = bounds.getNorthEast();
//         var SW = bounds.getSouthWest();
//         var NW = new google.maps.LatLng(NE.lat(), SW.lng());
//         var SE = new google.maps.LatLng(SW.lat(), NE.lng());

//         // console.log('NE', NE.toJSON());
//         // console.log('SW', SW.toJSON());
//         // console.log('NW', NW.toJSON());
//         // console.log('SE', SE.toJSON());

//         var height = google.maps.geometry.spherical.computeDistanceBetween(NW, SW) / sizeValue;
//         var width = google.maps.geometry.spherical.computeDistanceBetween(NW, NE) / sizeValue;
//         // console.log('height', height); // in km
//         // console.log('width', width); // in km

//         var NtoS = boundsJ.north - boundsJ.south;
//         var EtoW = boundsJ.east - boundsJ.west;

//         var NS = google.maps.geometry.spherical.computeOffset(NW, sizeValue, 90);
//         var SS = google.maps.geometry.spherical.computeOffset(NW, sizeValue, 180);
//         // console.log(NS.toString(), SS.toString());

//         for (var i = 0; i < height; i++) {
//             NE = google.maps.geometry.spherical.computeOffset(NS, i * sizeValue, 180);
//             SW = google.maps.geometry.spherical.computeOffset(SS, i * size, 180);

//             // console.log(NE.toString(), SW.toString());
//             for (var a = 0; a < width; a++) {
//                 var rectangle = new google.maps.Rectangle();
//                 var rectOptions = {
//                     strokeColor: "#FF0000",
//                     strokeOpacity: 0.8,
//                     strokeWeight: 1,
//                     fillOpacity: 0,
//                     map: map,
//                     bounds: new google.maps.LatLngBounds(SW, NE)
//                 };
//                 rectangle.setOptions(rectOptions);
//                 rectArr2.push(rectangle);
//                 getGridImage(rectangle, sizeValue) // add event handler

//                 var SW = google.maps.geometry.spherical.computeOffset(SW, sizeValue, 90)
//                 var NE = google.maps.geometry.spherical.computeOffset(NE, sizeValue, 90)
//             }
//         }
//     }

function getRectangles(bounds, scale, maptype, apikey) {
    var rectanglesArr = [];
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

            // var rectangle = new function() {
            //     this.north = north;
            //     this.east = east;
            //     this.south = south;
            //     this.west = west;
            //     this.bounds = {
            //         sw: {lat: this.south, lng: this.west},
            //         ne: {lat: this.north, lng: this.east}
            //     },
            //     this.center = {
            //         lat: (north+south)/2,
            //         lng: (east+west)/2,
            //         toUrlValue: function toUrlValue () {
            //             return Number(this.lat).toFixed(6) + ',' + Number(this.lng).toFixed(6);
            //         },
            //     }
            //     this.getNorthEast = function getNorthEast () {
            //         return {lat: north, lng: east};
            //     },
            //     this.getSouthWest = function getSouthWest () {
            //         return {lat: south, lng: west};
            //     }
            // };

            var rectangle = {
                north: north,
                east: east,
                south: south,
                west: west,
                bounds: {
                    sw: {lat: south, lng: west},
                    ne: {lat: north, lng: east}
                },
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
                // getURL(this, maptype, apikey): __getURL(this, maptype, apikey)

            };
            // rectangle.center.toUrlValue
            console.log(rectangle);
            console.log(rectangle.center.toUrlValue());
            rectanglesArr.push(rectangle);
            __getURL(rectangle, maptype, apikey, function (url) {
                console.log(url);
            });
        }
    }
    return rectanglesArr;
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

function init(boundaries, flags, gMap) {
    console.log("boundaries:", boundaries);
    console.log("flags:", flags);
    if (typeof boundaries === 'string' || boundaries instanceof String) {
        var boundariesArr = boundaries.split(',');

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
    } else {
        bounds = boundaries;
    }

    if (typeof bounds.north == 'undefined') {
        console.error("Bounds not defined:", bounds.north)
        return [];
    }

    const scale = flags.scale * 1000 || 5 * 1000; // scale in km
    const maptype = flags.maptype || 'hybrid';
    const apikey = flags.apikey || 'AIzaSyDLGb2-Qs3xFIx2TYQ7yKYLTypgo3TGcoY';
    console.log(scale);

    return getRectangles(bounds, scale, maptype, apikey);
    // var mapBounds = new googleMapsClient.maps.LatLngBounds({lat:-27.883, lng:153.284}, {lat:-27.988, lng:153.51})

    // const maxZoomService = new google.maps.MaxZoomService();
    // googleMapsClient.load(function(google) {
    //     maxZoomService = new google.maps.MaxZoomService()
    // });




    // if (sizeValue == NaN || sizeValue == Infinity || sizeValue <= 0) {
    //     console.error("Error: size is not a valid number!", sizeValue);
    //     return;
    // }





}
if (typeof module != 'undefined') {
    module.exports = init;
}
