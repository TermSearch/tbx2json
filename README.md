# Convert TermBase eXchange (tbx) to JSON

## Example usage:

````shell
tbx2json source.tbx target.json en-US nl-nl 100
````
This will convert source.tbx to target.json with US English as the source language and Dutch (nl) as the target language. It will only process the first 100 terms.



## Tools used:
- xmllint
- jsonlint

- Copy first 500 lines from tbx file. Use tail for last 500 lines.
````shell
< IATE.tbx | head -n 500 > IATE-first-500l.xml
````

- Verify xml file is correct (shows content if correct)
````shell
xmllint IATE-last-500l.xml
````
