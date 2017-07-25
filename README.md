# Map-dl

A tool to download Google map images.

[![npm](https://img.shields.io/npm/v/map-dl.svg?style=flat-square)](https://www.npmjs.com/package/map-dl)
[![npm](https://img.shields.io/npm/dm/map-dl.svg?style=flat-square)](https://www.npmjs.com/package/map-dl)
[![license](https://img.shields.io/npm/l/map-dl.svg?style=flat-square)](LICENCE.md)

## Websites
https://publicarray.github.io/map-dl/2.html

This version takes a 'screen-shot' of the map.

https://publicarray.github.io/map-dl/

This version allows downloading multiple images in a grid.

## The CLI

### Run it just once without installing

https://www.npmjs.com/package/npx

https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b

```bash
npx map-dl "[-27.883,153.531,-27.994,153.284]"
```

### Installation

```bash
npm install -g map-dl
```

### Usage

```bash
$ map-dl --help

 CLI to Download Google map images

 Usage
   $ map-dl [North, East, South, West]

 Options
   -s, --scale    Scale in km
   -t, --type     Map Type: roadmap, satellite, terrain or hybrid
   -o, --output   File-path to save the files
   -k, --apikey   Google Maps API key
   -v, --verbose  Verbose logging
   -V, --version  Display version number

 Example
   $ map-dl "[-27.883,153.531,-27.994,153.284]" --scale 5 --output ~/Desktop/map
```
