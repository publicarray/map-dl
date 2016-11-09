# Map-dl

A tool to download Google map images.

## Websites
https://publicarray.github.io/map-dl/2.html

This version takes a 'screen-shot' of the map.

https://publicarray.github.io/map-dl/

This version allows downloading multiple images in a grid.

## The CLI

### Installation

```bash
npm install -g map-dl
```

### Usage

`$ map-dl [North, East, South, West]`

#### Options
-s, --scale   Scale in km
-t, --type    Map Type: roadmap, satellite, terrain or hybrid
-o, --output  file-path to save the files
--apikey      Google Maps API key

#### Example
```bash
map-dl "[-27.883,153.531,-27.994,153.284]" --scale 5 --output ~/Desktop/map
```
