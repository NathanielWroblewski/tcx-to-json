var split = require('split')()

var ELEMENTS = {
  totalTimeSeconds:    tag('TotalTimeSeconds'),
  distanceMeters:      tag('DistanceMeters'),
  maximumSpeed:        tag('MaximumSpeed'),
  calories:            tag('Calories'),
  intensity:           tag('Intensity'),
  latitudeDegrees:     tag('LatitudeDegrees'),
  longitudeDegrees:    tag('LongitudeDegrees'),
  heartRateBpm:        tag('HeartRateBpm'),
  averageHeartRateBpm: tag('AverageHeartRateBpm'),
  maximumHeartRateBpm: tag('MaximumHeartRateBpm'),
  triggerMethod:       tag('TriggerMethod'),
  speed:               tag('Speed'),
  runCadence:          tag('RunCadence'),
  maxRunCadence:       tag('MaxRunCadence'),
  avgRunCadence:       tag('AvgRunCadence'),
  avgSpeed:            tag('AvgSpeed'),
  steps:               tag('Steps'),
  value:               tag('Value')
}

function tag(element) {
  return new RegExp('\<' + element + '\>(.*)\<\/' + element + '\>')
}

var parser = {
  state: {
    elements: ELEMENTS,
    maxmimumHeartRateBpm: false,
    averageHeartRateBpm: false,
    heartRateBpm: false,
    results: {}
  },

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

  _parseLine: function(attrs) {
    var match = attrs.text.match(attrs.pattern, '/1')

    if (!match || !match[1]) return false

    this._checkParentElements(attrs.element)

    if (attrs.element === 'value') {
      this._pushParentValue(match[1])
    } else {
      this._addResult(attrs.element, match[1])
    }
  },

  _checkParentElements: function(element) {
    if (element === 'maximumHeartRateBpm') this.state.maximumHeartRateBpm = true
    if (element === 'averageHeartRateBpm') this.state.averageHeartRateBpm = true
    if (element === 'heartRateBpm') this.state.heartRateBpm = true
  },

  _pushParentValue: function(value) {
    if (this.state.maximumHeartRateBpm) {
      this._addResult('maximumHeartRateBpm', value)
    } else if (this.state.averageHeartRateBpm) {
      this._addResult('averageHeartRateBpm', value)
    } else if (this.state.heartRateBpm) {
      this._addResult('heartRateBpm', value)
    }
  },

  _addResult: function(key, value) {
    this.state[key] = false

    if (this.state.results[key]) {
      this.state.results[key].push(value)
    } else {
      this.state.results[key] = [value]
    }
  },

  _print: function() {
    console.log(JSON.stringify(this.state.results))
  }
}

process.stdin.pipe(split).on('data', parser.parse.bind(parser))
