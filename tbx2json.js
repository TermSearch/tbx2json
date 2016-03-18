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
	.option('-e, --encoding <encoding>', 'encoding of tbx file, e.g. utf16le. Default is utf8')
	.option('-t --tbxtype <tbxType>', 'tbx type, either TBX-Default or TBX')
	.on('--help', function () {
		console.log('  Examples:');
		console.log('');
		console.log('    $ ??? ');

	})
	.parse(process.argv);

const encoding = program.encoding || 'utf8'; // Default encoding = utf8
// TBX-Default uses tig
// TBX uses ntig
const tbxType = program.tbxType || 'TBX-Default';

//
// tbx2json
//

// Booleans help write valid JSON
// Write opening [ on begin
// Write closing ] on end
let end = false;
let begin = true;

// Converts tmx (xml format) to Javascript objects
const tbx2obj = function (chunk, enc, callback) {
	let $ = cheerio.load(chunk, {
		xmlMode: true
	});

	const termEntries = $('termEntry');
	termEntries.each((i, termEntry) => {
		let o = {};

		// Write to output object
		o.termID = $(termEntry).attr('id');

		// Contains descriptive information about termEntry
		const descrip = $(termEntry).find('descrip');
		// Type could be subjectField or definition
		const descripType = $(descrip).attr('type');
		// The text contained in the type xml tags
		const descripText = $(descrip).text();
		o[descripType] = descripText;

		// Find notes
		const note = $(termEntry).find('note');
		// If found, write note text to output object
		if (note.length != 0) o.note = $(note).text();

		const langSet = $(termEntry).find('langSet');
		langSet.each((i, langSetEntry) => {
			const lang = $(langSetEntry).attr('xml:lang');

			// Create an empty array for all found language codes
			o[lang] = [];

			let tig;
			if (tbxType === 'TBX-Default') tig = $(langSetEntry).find('tig');
			if (tbxType === 'TBX') tig = $(langSetEntry).find('ntig');

			// if tig contains terms map map them to the output object o
			if (tig.length !=0 ) tig.each( (i, tigEntry) => {
				const term = $(tigEntry).find('term').text();
				o[lang].push(term);
			});

		})
		this.push(o);
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
	.pipe(through2.obj(obj2json))
	.on('end', function () {
		process.stdout.write(']');
	})
	.pipe(process.stdout);
