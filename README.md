# Convert tbx to json
Convert TermBase eXchange (tbx) format files to a flat JSON format file.

## Install
`````bash
$ npm install -g tbx2json
`````

## Run
````bash
$ tbx2json source.tbx target.json en-US nl-nl 100
````
This will convert source.tbx to target.json with US English as the source language and Dutch (nl) as the target language. It will only process the first 100 terms.

See package.json for build and test scripts. More documentation can be found in tests.

## Features
- Tested on Microsoft tbx files
- Tested on the huge IATE tbx database (Extract language combination first. Some languages contain invalid xml).

Converts tbx (both simple and complex) to a flat json dictionary file with the following format (example):

````json
[{
     "id": "IATE-3557458",
     "subjectFields": "[2826004, 12345]",
     "note": "Drug addiction",
     "de": "Handelsroute",
     "nl": [
         "smokkelroute"
     ]
 },
 {
     "id": "IATE-3557458",
     "subjectFields": "[2826004, 12345]",
     "note": "Drug addiction",
     "de": "Schmuggelroute",
     "nl": [
         "smokkelroute"
     ]
}]
````

## Notes
- Supports only valid xml (though some invalid chars are ignored)
- Use xmllint to validate xml (see below)
- USe jsonlint to validate json

## Tools
- Copy first 500 lines from tbx file. Use tail for last 500 lines.

```shell
$ < IATE.tbx | head -n 500 > IATE-first-500l.xml
```

- Validate xml (shows content if correct)

```shell
$ xmllint IATE-last-500l.xml
```
