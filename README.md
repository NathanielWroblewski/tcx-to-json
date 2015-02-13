# tcx-to-json
Converts Garmin .TCX format to JSON.  Simple, lightweight node script with a single dependency on npm 
[split](https://github.com/dominictarr/split).

Script takes an input stream, and logs stringified JSON to STDOUT:

```sh
$ cat sample.tcx | node tcx_to_json.js >> sample.json
```
