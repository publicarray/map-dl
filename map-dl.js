'use strict';
if (typeof module != 'undefined') {
    // module.exports = MapDl();
    module.exports = new MapDl();
}

function MapDl(options) {
    if (!(this instanceof MapDl)) {
        console.log("created new instance");
        return new MapDl()(options);
    }

    // public variables
    this.options = { // sane default options
        boundaries: undefined,
        scale: 5 * 1000, // scale in km
        maptype: 'satellite',
        apikey: 'AIzaSyDLGb2-Qs3xFIx2TYQ7yKYLTypgo3TGcoY',
        gMap: undefined,
        verbose: false,
        callback: function(rectangle, total){console.log(rectangle.url);(rectangle.num == total)?console.log("Done!"):0;},
    };
    // var self = this;

    // private variables
    var v = false; // verbose output

    // public API
    // return {
    //     run: run.bind(this),
    //     options: this.options,
    // }
    return run.bind(this);

    function run(options) { // allow specific options
        options = options || this.options;
        var apikey = options.apikey || this.options.apikey;
        var gMap = options.gMap || this.options.gMap;
        v = options.verbose || this.options.verbose;
        var boundaries = options.boundaries || this.options.boundaries;
        var scale = options.scale * 1000 || this.options.scale; // scale in km
        var maptype = options.maptype || this.options.maptype;
        var callback = options.callback || this.options.callback;

        boundaries = phaseBoundary(boundaries);
        if (typeof boundaries.north == 'undefined') {
            console.error("Bounds not defined:", boundaries.north)
            return;
        }

        verbose("options selected:", options);
        getRectangles(boundaries, scale, maptype, apikey, gMap, callback);
    }


    // private functions
    function verbose(message, obj) {
        if (v && typeof obj != 'undefined') {
            console.log(message, obj);
        } else if (v) {
            console.log(message);
        }
    }

    function toRadians(num) {
        var pi = Math.PI;
        return (num)*(pi/180);
    }

    function phaseBoundary(boundaries) {
        if (typeof boundaries === 'string' || boundaries instanceof String) {
            var boundariesArr = boundaries.split(',');

            if (boundaries[0].charAt(0) == '[') {
                boundariesArr = JSON.parse(boundaries);
            }
            verbose(boundariesArr);
            if (boundariesArr.length != 4) {
                console.error("Invalid number of arguments. Got " + boundariesArr.length + " expected 4:", options.boundaries);
                return 1;
            }

            return boundaries = {
                north: boundariesArr[0],
                east: boundariesArr[1],
                south: boundariesArr[2],
                west: boundariesArr[3],
            }
        }
        return boundaries || {};
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

    function getRectangles(bounds, scale, maptype, apikey, gMap, c) {
        // var rectanglesArr = [];
        var NE = {lat:bounds.north, lng:bounds.east};
        var SW = {lat:bounds.south, lng:bounds.west};
        var NW = {lat:bounds.north, lng:bounds.west};
        var SE = {lat:bounds.south, lng:bounds.east};

        verbose('NE', NE);
        verbose('SW', SW);
        verbose('NW', NW);
        verbose('SE', SE);

        var height = computeDistanceBetween(NW, SW) / scale; // in km
        var width = computeDistanceBetween(NW, NE) / scale; // in km
        const totalImages = Math.ceil(height) * Math.ceil(width);
        var count = 0;

        verbose('height', height);
        verbose('width', width);
        verbose('totalImages', totalImages);

        var totalHeight = bounds.north - bounds.south; // in lat
        var totalWidth = bounds.east - bounds.west; // in long
        verbose('totalHeight', totalHeight);
        verbose('totalWidth', totalWidth);
        // var addheight = totalHeight/height; // cache value to add by
        // var addwidth = totalWidth/width; // cache value to add by
        var count = 0;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                count++;
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
                    num: count,
                    x: i,
                    y: j,
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

                // create URL
                var size = {height: 640, width: 640}; // image dimensions // max = 640 or 800
                if (typeof gMap == 'undefined') {
                    rectangle.url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + rectangle.center.toUrlValue() +
                        '&zoom=' + getBoundsZoomLevel(rectangle, size, maptype) +
                        '&format=png&maptype=' + maptype +
                        '&size='+size.height+'x'+size.width+'&scale=2' +
                        '&key=' + apikey;
                    verbose(rectangle.url);
                    // rectanglesArr.push(rectangle);

                    c(rectangle, totalImages);
                    // count++;
                    // if (count > height + width) {
                    //     console.log("Done!");
                    // }
                } else {
                    rectangle.gbounds = new gMap.maps.LatLngBounds(rectangle.bounds.sw, rectangle.bounds.ne);
                    getBoundsZoomLevel(rectangle, size, maptype, gMap, function(zoom, rectangle) {
                        rectangle.url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + rectangle.center.toUrlValue() +
                            '&zoom=' + zoom +
                            '&format=png&maptype=' + maptype +
                            '&size='+size.height+'x'+size.width+'&scale=2' +
                            '&key=' + apikey;
                        verbose(rectangle.url);
                        // rectanglesArr.push(rectangle);
                        c(rectangle, totalImages);
                        // count++;
                        // if (count > height +width) {
                        //     console.log("Done!");
                        // }
                    });
                }


                verbose(rectangle);
                // console.log(rectangle.center.toUrlValue());
                // rectanglesArr.push(rectangle);
            }
        }
    }

    // https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds#13274361
    function getBoundsZoomLevel(rectangle, mapDim, maptype, gMap, callback) { // if gMap is defined a callback must also be defined
        // if (typeof mapDim == 'undefined') {
        //     mapDim = {height: 640, width: 640}; // image dimensions // max = 640 or 800
        // }

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

        var ne = rectangle.bounds.ne;
        var sw = rectangle.bounds.sw;

        var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

        var lngDiff = ne.lng - sw.lng;
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        var zoom = Math.min(latZoom, lngZoom, ZOOM_MAX);

        if (typeof gMap == 'undefined') {
            return zoom;
        } else if (typeof gMap == 'undefined' || maptype == 'roadmap' || maptype == 'terrain' || zoom < 10) {
            verbose("not using the maxZoomService for zoom", zoom); // I expect that zoom 1-9 are all globally available
            callback(zoom, rectangle);
        } else {
            // if maxZoomService is available and the map type is not a roadmap or terrain and the zoom is close enough (10-21) than check with the maxZoomService
            var maxZoomService = new gMap.maps.MaxZoomService();
                maxZoomService.getMaxZoomAtLatLng(rectangle.center, function (response) {
                if (response.status !== 'OK') {
                    console.error("Error contacting MaxZoomService", response.status);
                    verbose(response);
                } else {
                    if (response.zoom < zoom) {
                        console.warn("Sorry, but the max zoom for this region is: " + response.zoom + ". changed from: ", zoom);
                        zoom = response.zoom;
                    }
                }
                callback(zoom, rectangle);
            });
        }
    }
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
