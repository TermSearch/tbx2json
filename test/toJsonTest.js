var expect = require('chai').expect;
var toJson = require('../compiled/toJson.js');

var rawTermEntry = require('./rawTermEntry.json');
var step1 = toJson.step1(rawTermEntry);
var step2 = toJson.step2(step1, 'de', 'nl');
var step3 = toJson.step3(step2, 'de', 'nl');

var rawTermEntryMS = require('./rawTermEntryMS.json');
var step1MS = toJson.step1(rawTermEntryMS);
var step2MS = toJson.step2(step1MS, 'en-US', 'nl-nl');
var step3MS = toJson.step3(step2MS, 'en-US', 'nl-nl');

// IATE TBX with tig tbx format

// Step 1: multilingual termbase object
// {
//	...
//     "de": [
//         "Handelsroute",
//         "Schmuggelroute"
//     ],
//	...
//     ],
//     "lt": [
//         "kontrabandos kelias"
//     ],
//     "lv": [
//         "piegādes ķēde"
// ...
//     "nl": [
//         "smokkelroute"
//     ],
//	...
// }
describe('Testing step 1 with IATE', function () {
	it('should have an array de with Handelsroute & Schmuggelroute in it', function () {
		expect(step1.de).to.be.a('array');
		expect(step1.de[0]).to.equal('Handelsroute');
		expect(step1.de[1]).to.equal('Schmuggelroute');
	});
});

// Step 2: bilingual termbase object
// {
//     "nl": [
//         "smokkelroute"
//     ],
//     "de": [
//         "Handelsroute",
//         "Schmuggelroute"
//     ]
// }
describe('Testing step 2 with IATE', function () {
	it('should have an array "de" with two entries', function () {
		expect(step2.de).to.a('array').with.length(2);
	});
});

// Step 3 bilingual dictionary array
// [{
//     "id": "IATE-3557458",
//	   "subjectFields": "[2826004]",
//	   "note": "Drug addiction"
//     "de": "Handelsroute",
//     "nl": [
//         "smokkelroute"
//     ]
// },
// {
//     "id": "IATE-3557458",
//	   "subjectFields": "[2826004]",
//	   "note": "Drug addiction"
//     "de": "Schmuggelroute",
//     "nl": [
//         "smokkelroute"
//     ]
// }]
describe('Testing step 3 with IATE', function () {
	it('should have an ID IATE-3557458', function () {
		expect(step3[0]).to.have.a.property('id', 'IATE-3557458');
	});
	it('should have a property subjectFields thats an array with length 1', function() {
		expect(step3[0].subjectFields).to.be.a('array')
			.with.length(1);
	});
	it('should have a property note with string Drug addiction', function() {
		expect(step3[0]).to.have.a.property('note', 'Drug addiction');
	});
	it('should be an array with two entries', function () {
		expect(step3).to.a('array')
			.with.length(2);
	});
});

// Microsoft TBX with ntig tbx format

// Step 1: multilingual termbase object
// {
//     "en": [
//         "alphanumeric sort"
//     ],
//     "nl": [
//         "alfanumerieke sortering"
//     ],
// }
describe('Testing step 1 with MS', function () {
	it('should have two properties en and nl in it', function () {
		expect(step1MS['en-US'][0]).to.equal('alphanumeric sort');
		expect(step1MS['nl-nl'][0]).to.equal('alfanumerieke sortering');
	});
});

// Step 3 bilingual dictionary array
// [{
//     "id": "1_11444",
//		 "definition" : "A method of sorting data..."
//     "en-US": "alphanumeric sort",
//     "nl-nl": [
//         "alfanumerieke sortering"
//     ]
// }]
describe('Testing step 3 with MS', function () {
	it('should have an ID 1_11444', function () {
		expect(step3MS[0]).to.have.a.property('id', '1_11444');
	});
	it('should have a property definition with a string', function () {
		expect(step3MS[0].definition).to.be.a('string');
	});
	it('should have a property nl-nl with an array as content', function () {
		expect(step3MS[0]['nl-nl']).to.be.a('array');
	});
});
