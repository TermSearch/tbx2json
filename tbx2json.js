#!/usr/bin/env node --harmony
'use strict'

const cheerio = require('cheerio');
const fs = require('fs');
const through2 = require('through2');
const program = require('commander');
const packageJson = require('./package.json');

// Output schema
// {
// 	termID: string,							// req
// 	subjectFields: [ string ],
// 	note: string,
//	definition: string,
// 	de: [ string ],
// 	nl: [ string ],
// 	en: [ string ],
// 	xy: [ string ] 							// etc.
// }


//
// Command line interface
//

program
	.version(packageJson.version)
	// .option('-e, --encoding <encoding>', 'encoding of tmx file, e.g. utf16le. Default is utf8')
	.on('--help', function () {
		console.log('  Examples:');
		console.log('');
		console.log('    $ ??? ');

	})
	.parse(process.argv);

const encoding = 'utf8'; // Default encoding = utf8

//
// tbx2json
//

// Booleans help write valid JSON
// Write opening [ on begin
// Write closing ] on end
var end = false;
var begin = true;

// Converts tmx (xml format) to Javascript objects
const tbx2obj = function (chunk, enc, callback) {
	let $ = cheerio.load(chunk, {
		xmlMode: true
	});
	const termEntries = $('termEntry');
	termEntries.each((i, termEntry) => {

		const id = $(termEntry).attr('id');
		const langSet = $(termEntry).find('langSet');
		const descrip = $(termEntry).find('descrip');
		const descripType = $(descrip).attr('type');
		const descripText = $(descrip).text();

		console.log("termID: " + id);
		console.log(descripType + ": " + descripText);

		langSet.each((i, langSetEntry) => {
			const lang = $(langSetEntry).attr('xml:lang');
			const tig = $(langSetEntry).find('tig');
			const ntig = $(langSetEntry).find('ntig');
			let tigs = false;

			if (tig.length != 0) tigs = tig;
			if (ntig.length != 0) tigs = ntig;

			if (tigs) tigs.each( (i, tigEntry) => {
				const term = $(tigEntry).find('term').text();
				console.log(lang + ": " + term);
			});

		})
		console.log('\n');
	});
	callback()
}

// Converts Javascript objects to valid JSON (enclosed in an array [])
const obj2json = function (chunk, enc, callback) {
	if (begin) this.push('[');
	if (!begin) this.push(',\n');
	begin = false;
	this.push(JSON.stringify(chunk, null, 4));
	callback()
}

//
// Glueing all streams together
//

process.stdin.setEncoding(encoding)
	.pipe(through2.obj(tbx2obj))
	// .pipe(through2.obj(obj2json))
	.on('end', function () {
		process.stdout.write(']');
	})
	.pipe(process.stdout);
