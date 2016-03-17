#!/usr/bin/env node --harmony
'use strict'

const cheerio = require('cheerio');
const fs = require('fs');
const through2 = require('through2');
const program = require('commander');
const packageJson = require('./package.json');

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

		langSet.each((i, langSetEntry) => {
			const lang = $(langSetEntry).attr('xml:lang');
			const term = $(langSetEntry).find('term').text();


			console.log(lang);
			console.log(term);
		})

		console.log(id);
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
