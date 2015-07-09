#! /usr/bin/env node


// Modules
'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash-node');
var ProgressBar = require('progress');
var XmlStream = require('xml-stream');
var through = require('through');

// Project modules
var toJson = require('./toJson');

// Help for command line interface
var usageExample = 'Usage: tbx2json input.tbx output.json de nl 100';
// Show usageExample if no arguments are specified
if (!process.argv[2]) {
	console.log(usageExample);
	process.exit();
}

// Command line options
var inputFile = process.argv[2];
var outputFile = process.argv[3] || process.argv[2] + '.json';
var maxTerms = Number(process.argv[6]) || Number.POSITIVE_INFINITY; // default = all terms
var sourceLang = process.argv[4] || 'de';
var targetLang = process.argv[5] || 'nl';

// Gets the file size of filename in bytes
var getFilesizeInBytes = function getFilesizeInBytes(filename) {
	var stats = fs.statSync(filename);
	var fileSizeInBytes = stats.size;
	return fileSizeInBytes;
};

// Variables
var counter = 0;
var streamHasEnded = false;

//
// Streams
//
var stream = fs.createReadStream(inputFile, {
	encoding: 'utf8'
});
var writeStream = fs.createWriteStream(outputFile, {
	encoding: 'utf8'
});

// First pass buffer through this filter, to remove invalid characters from xml
var filterInvalid = through(function (buffer) {
	var data;
	var invalidXmlChars = /&#[0-9];/g; // &#3, &#4, etc;
	var containsInvalidChars = buffer.toString().match(invalidXmlChars);
	if (containsInvalidChars) console.log('\n\nWarning: This tbx file contains invalid xml. Invalid characters removed and ignored. Please verify your results and validate your tbx file.\n\n');
	data = buffer.toString().replace(invalidXmlChars, '');
	bar.tick(buffer.length);
	return this.emit('data', data);
});

// First filter invalid xml characters
stream.pipe(filterInvalid);

// Then create a xml stream from the filtered streamHasEnded
var xml = new XmlStream(filterInvalid);

// Use "collect" to keep obj/arr structure of xml
xml.collect('term');
xml.collect('langSet');
xml.collect('tig');

// Open chunk once a termEntry element is completely loaded
xml.on('endElement: termEntry', function (termEntry) {
	// console.log(JSON.stringify(termEntry, null, 4));

	// Step 1: convert termEntry to dictionary object
	var objStep1 = toJson.step1(termEntry);

	// Step 2: remove languages other than source and target
	var objStep2 = toJson.step2(objStep1, sourceLang, targetLang);
	var isObjStep2Empty = _.isEmpty(objStep2);

	// Step 3: convert dict object to dictionary array
	var objStep3 = [];
	if (!isObjStep2Empty) {
		objStep3 = toJson.step3(objStep2, sourceLang, targetLang);
	}

	// Step 4: write valid JSON to file
	if (objStep3.length > 0) {
		var jsonStr = toJson.toJsonStr(objStep3, counter);
		writeStream.write(jsonStr);
		counter++;
	}

	// Close input stream if counter reaches maxTerms
	if (counter >= maxTerms && !streamHasEnded) {
		stream.close();
		streamHasEnded = true;
	}
});

// Log progess in bar, with ETA in seconds
console.log();
var bar = new ProgressBar('  processing [:bar] :percent :etas', {
	complete: '=',
	incomplete: ' ',
	width: 50,
	total: getFilesizeInBytes(inputFile)
});

// Catch any errors
xml.on('error', function (message) {
	console.log('\nError in parsing xml: ' + message);
});

// Close stream and file, report results to console
stream.on('close', function () {
	writeStream.write(']');
	console.log('\n\nDone processing. Results written in file ' + outputFile);
	console.log('Total terms written: ' + counter);
	console.log('Kilobytes processed: ' + getFilesizeInBytes(inputFile) / 1000);
	console.log('Kilobytes written: ' + getFilesizeInBytes(outputFile) / 1000);
});