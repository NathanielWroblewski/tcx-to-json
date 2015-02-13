# tcx-to-json
Converts Garmin .TCX format to JSON.  Simple, lightweight node script with a single dependency on npm
[split](https://github.com/dominictarr/split).

This is not a robust solution.  It does not traverse an XML DOM.  It instead
parses the file line-by-line for elements using regex.  Therefore, in order to
parse a file or stream properly, the stream should be formatted so there is
one XML node on each line, as TCX files are formatted when exported from Garmin Connect.  For any questions, consult the sample.tcx and the corresponding
sample.json.

Script takes an input stream, and logs stringified JSON to STDOUT:

```sh
$ cat sample.tcx | node tcx_to_json.js >> sample.json
```
