var _ = require('lodash-node');

// Converts "123, 345" to [123, 345]
var stringOfNumsToArr = function(subjectFieldStr) {
	var arr = subjectFieldStr.split(", ");
	if (arr[0] === '') {
		return ''; // empty string, no sf specified
	} else {
		return arr.map(function(n, i, a) {
			return +n;
		});
	}
};

// Convert the array of tig term objects to an array of term strings
var getTermsFromTig = function (tig) {
	return tig.map(el => el.term[0]);
};

// Convert the array of ntig term objects to an array of term strings
var getTermsFromNTig = function (ntig) {
	return [ntig.termGrp.term[0].$text];
};

// Convert a langSet object to flatter, simpler object
var convertLangSet = function (langSet) {
	return langSet.map(set => {
		// Get the language code, i.e. "nl"
		let lang = set.$["xml:lang"];
		// The returned object looks like this { nl: ["term1", "term2", "term3"] }
		// First check if termEntry format is tig of ntig
		if (set.tig) return {
			[lang]: getTermsFromTig(set.tig)
		};
		else {
			return {
				[lang]: getTermsFromNTig(set.ntig)
			};
		}
	});
};

// Get subjectfields and convert string to array of numbers
var getMetaData = function (termEntry) {
	// return obj o
	let o = {};
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

var step1 = function (termEntry) {
	var objStep1 = {};
	let langSet = convertLangSet(termEntry.langSet);
	langSet.forEach(function (term, i, arr) {
		objStep1.metaDataObj = getMetaData(termEntry);
		let lang = Object.keys(term)[0];
		objStep1[lang] = term[lang];
	});
	// Return false if object is empty
	return _.isEmpty(objStep1) ? false : objStep1;
};

var step2 = function (objStep1, sourceLang, targetLang) {
	var objStep2 = false;
	if (objStep1[sourceLang] && objStep1[targetLang]) {
		objStep2 = {
			metaDataObj: objStep1.metaDataObj,
      [sourceLang]: objStep1[sourceLang],
			[targetLang]: objStep1[targetLang]
		};
	}
	return objStep2;
};

var step3 = function (objStep2, sourceLang, targetLang) {
	var arrStep3 = [];
	objStep2[sourceLang].forEach(function (termStr) {
		// clone the metaDataObj as basis for dictionary entry
		let entry = JSON.parse(JSON.stringify(objStep2.metaDataObj));
		entry[sourceLang] = termStr;
		entry[targetLang] = objStep2[targetLang];
		arrStep3.push(entry);
	});
	// return false if empty
	return arrStep3.length > 0 ? arrStep3 : false;
};

var getDictArr = function(termEntry, sourceLang, targetLang) {
	var objStep1;
	var objStep2;
	var arrStep3;

	// Step 1: convert termEntry to dictionary object
	objStep1 = step1(termEntry);

	// Step 2: remove languages other than source and target
	if (objStep1) objStep2 = step2(objStep1, sourceLang, targetLang);

	// Step 3: convert dictionary object to dictionary array, false if empty
	if (objStep2) arrStep3 = step3(objStep2, sourceLang, targetLang);
	// Returns false if empty
	return arrStep3;
};

module.exports.step1 = step1;
module.exports.step2 = step2;
module.exports.step3 = step3;
module.exports.getDictArr = getDictArr;
