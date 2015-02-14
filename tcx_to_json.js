var split = require('split')()

/**
 * The Garmin TCX format is an XML file consisting of the following custom
 * elements:
 **/
var ELEMENTS = {
  totalTimeSeconds:    tag('TotalTimeSeconds'),
  distanceMeters:      tag('DistanceMeters'),
  maximumSpeed:        tag('MaximumSpeed'),
  calories:            tag('Calories'),
  intensity:           tag('Intensity'),
  latitudeDegrees:     tag('LatitudeDegrees'),
  longitudeDegrees:    tag('LongitudeDegrees'),
  heartRateBpm:        openingTag('HeartRateBpm'),
  averageHeartRateBpm: openingTag('AverageHeartRateBpm'),
  maximumHeartRateBpm: openingTag('MaximumHeartRateBpm'),
  triggerMethod:       tag('TriggerMethod'),
  speed:               tag('Speed'),
  runCadence:          tag('RunCadence'),
  maxRunCadence:       tag('MaxRunCadence'),
  avgRunCadence:       tag('AvgRunCadence'),
  avgSpeed:            tag('AvgSpeed'),
  steps:               tag('Steps'),
  value:               tag('Value')
}

/**
 * tag() returns a regular expression that matches opening and closing tags
 * for a given element and captures the inner value
 *
 * @params <String> element
 * @return <RegExp>
 **/
function tag(element) {
  return new RegExp('\<' + element + '\>(.*(?=\<))\<\/' + element + '\>')
}
function openingTag(element) {
  return new RegExp('\<' + element + '\>')
}

/**
 * The implementation here does not parse an XML DOM.  The parser is sent each
 * line of a TCX and parses for elements.  Some of these elements, like
 * heartRateBpm, averageHeartRateBpm, and maximumHeartRateBpm, have values that
 * are uncharacteristically nested as children nodes.
 *
 * Ex.
 *   Characteristic node:
 *     <RunCadence>80</RunCadence>
 *
 *   Uncharacteristic node:
 *     <AverageHeartRateBpm>
 *       <value>80</value>
 *     </AverageHeartRateBpm>
 *
 * The parser object stores state when it encounters a value that uses child
 * nodes.  That way, when called on the following line, it has a reference to
 * know which type of parent it belongs to.
 **/
var parser = {

  state: {
    elements: ELEMENTS,
    maxmimumHeartRateBpm: false,
    averageHeartRateBpm: false,
    heartRateBpm: false,
    results: {}
  },

  /**
   * parse() checks the line of text against each TCX element
   *
   * @params <String> line
   **/
  parse: function(line) {
    if (!line) this._print()
    for (var element in this.state.elements) {
      if (this.state.elements.hasOwnProperty(element)) {
        this._parseLine({
          text: line,
          element: element,
          pattern: ELEMENTS[element]
        })
      }
    }
  },

  /**
   * parseLine() stores a matched element's value in state
   *
   * @params <Object> attrs
   *   {text: <String>, element: <String>, pattern: <RegExp>}
   * @return <Boolean>
   **/
  _parseLine: function(attrs) {
    var match = attrs.text.match(attrs.pattern, '/1')

    if (!match) return false

    this._checkParentElements(attrs.element)

    if (attrs.element === 'value') {
      this._pushParentValue(match[1])
    } else if (match[1]) {
      this._addResult(attrs.element, match[1])
    }

    return true
  },

  /**
   * _checkParentElements() stores state if the element uncharacteristically
   * stores its value in a child node
   *
   * @params <String> element
   **/
  _checkParentElements: function(element) {
    if (element === 'maximumHeartRateBpm') this.state.maximumHeartRateBpm = true
    if (element === 'averageHeartRateBpm') this.state.averageHeartRateBpm = true
    if (element === 'heartRateBpm') this.state.heartRateBpm = true
  },

  /**
   * _pushParentValue() stores an uncharacteristic element's value in state
   * and relates it to the proper parent
   *
   * @params <String> value
   **/
  _pushParentValue: function(value) {
    if (this.state.maximumHeartRateBpm) {
      this._addResult('maximumHeartRateBpm', value)
    } else if (this.state.averageHeartRateBpm) {
      this._addResult('averageHeartRateBpm', value)
    } else if (this.state.heartRateBpm) {
      this._addResult('heartRateBpm', value)
    }
  },

  /**
   * _addResult() is the interface for adding a value to state
   *
   * @params <String> key
   * @params <String> value
   **/
  _addResult: function(key, value) {
    this.state[key] = false

    if (this.state.results[key]) {
      this.state.results[key].push(value)
    } else {
      this.state.results[key] = [value]
    }
  },

   // _print() logs the JSON stored in state to STDOUT
  _print: function() {
    console.log(JSON.stringify(this.state.results, null, 2))
  }
}

/**
  * buffers in a stream from STDIN, splits the stream on new lines,
  * and calls parser.parse() on each line
  **/
process.stdin.pipe(split).on('data', parser.parse.bind(parser))
