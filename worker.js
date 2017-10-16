'use strict';

importScripts('map-dl.js');
MapDl = new MapDl();

onmessage = function(e) {
    // console.log('Message received from main script', e);
    var rectArr = [];
    var mapDlOptions = e.data;
    mapDlOptions.callback = function (rectangle) {
        // Remove functions as they can't be passed to parent script)
        rectangle.center.toUrlValue = undefined;
        rectangle.getNorthEast = undefined;
        rectangle.getSouthWest = undefined;
        rectArr.push(rectangle);
    }

    MapDl(mapDlOptions);
    postMessage(rectArr);
    rectArr = [];
    // console.log('Posting message back to main script');
}
