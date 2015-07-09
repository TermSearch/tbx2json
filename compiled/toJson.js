// Converts "123, 345" to [123, 345]
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var stringOfNumsToArr = function stringOfNumsToArr(subjectFieldStr) {
	var arr = subjectFieldStr.split(', ');
	if (arr[0] === '') {
		return ''; // empty string, no sf specified
	} else {
		return arr.map(function (n, i, a) {
			return +n;
		});
	}
};

// Convert the array of tig term objects to an array of term strings
var getTermsFromTig = function getTermsFromTig(tig) {
	return tig.map(function (el) {
		return el.term[0];
	});
};

// Convert the array of ntig term objects to an array of term strings
var getTermsFromNTig = function getTermsFromNTig(ntig) {
	return [ntig.termGrp.term[0].$text];
};

// Convert a langSet object to flatter, simpler object
var convertLangSet = function convertLangSet(langSet) {
	return langSet.map(function (set) {
		// Get the language code, i.e. "nl"
		var lang = set.$['xml:lang'];
		// The returned object looks like this { nl: ["term1", "term2", "term3"] }
		// First check if termEntry format is tig of ntig
		if (set.tig) return _defineProperty({}, lang, getTermsFromTig(set.tig));else {
			return _defineProperty({}, lang, getTermsFromNTig(set.ntig));
		}
	});
};

// Convert obj to JSON string
var toJsonStr = function toJsonStr(obj, counter) {
	var jsonStr = '';
	// if counter is 0, it's beginning of the file > open array
	if (counter === 0) jsonStr += '[';
	obj.forEach(function (e) {
		// if it's not the beginning of the file, place comma before next element
		if (counter > 0) jsonStr += ',';
		jsonStr += JSON.stringify(e, null, 4);
	});
	return jsonStr;
};

// Get subjectfields and convert string to array of numbers
var getMetaData = function getMetaData(termEntry) {
	// return obj o
	var o = {};
	// Check if termEntry has an id, assign it to return obj o
	if (termEntry.$) o.id = termEntry.$.id;
	// Check if termEntry has a descripGrp
	var descripGrp = termEntry.descripGrp || termEntry.langSet[0].descripGrp;
	if (descripGrp) {
		if (descripGrp.note) o.note = descripGrp.note;
		var descrip = descripGrp.descrip;
		if (descrip) {
			if (descrip.$.type === 'subjectField') o.subjectFields = stringOfNumsToArr(descrip.$text);
			if (descrip.$.type === 'definition') o.definition = descrip.$text;
		}
	}
	return o;
};

var step1 = function step1(termEntry) {
	var objStep1 = {};
	var langSet = convertLangSet(termEntry.langSet);
	langSet.forEach(function (term, i, arr) {
		objStep1.metaDataObj = getMetaData(termEntry);
		var lang = Object.keys(term)[0];
		objStep1[lang] = term[lang];
	});
	return objStep1;
};

var step2 = function step2(objStep1, sourceLang, targetLang) {
	var objStep2 = {};
	if (objStep1[sourceLang] && objStep1[targetLang]) {
		var _objStep2;

		objStep2 = (_objStep2 = {
			metaDataObj: objStep1.metaDataObj
		}, _defineProperty(_objStep2, sourceLang, objStep1[sourceLang]), _defineProperty(_objStep2, targetLang, objStep1[targetLang]), _objStep2);
	}
	return objStep2;
};

var step3 = function step3(objStep2, sourceLang, targetLang) {
	var arrayStep3 = [];
	objStep2[sourceLang].forEach(function (termStr) {
		// clone the metaDataObj as basis for dictionary entry
		var entry = JSON.parse(JSON.stringify(objStep2.metaDataObj));
		entry[sourceLang] = termStr;
		entry[targetLang] = objStep2[targetLang];
		arrayStep3.push(entry);
	});
	return arrayStep3;
};

module.exports.step1 = step1;
module.exports.step2 = step2;
module.exports.step3 = step3;
module.exports.toJsonStr = toJsonStr;