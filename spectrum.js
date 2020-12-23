const words = require('./words.js');
const ryb2rgb = require('ryb2rgb');

const spectrumDefinition = [
  ['black', 'white'],
  ['red', 'green'],
  ['blue', 'orange'],
  ['yellow', 'purple']
];

const spectrumTags = [
  'black',
  'white',
  'red',
  'green',
  'blue',
  'orange',
  'yellow',
  'purple',
];
const THRESHOLD = 0.1;

function move(spec, direction) {
  var copy = {...spec};
  var conv = converse([direction])[0];
  for (const k in copy) {
    copy[k] = copy[k] * .66;
  }
  copy[direction] = Math.min(copy[direction] + 0.2, 1.0);
  copy[conv] = Math.max(copy[conv] - 0.2, 0.0);
  return copy;
}

function extractSpectrum(phrase) {
  // first phase, find singularNounPhrase and pluralNounPhrase
  // second phase, extract tags
  if (!phrase.children) {
    if (!words.data[phrase.raw]) {
      return new Set();
    }
    var tags = new Set(words.data[phrase.raw].filter((t) => spectrumTags.includes(t)));
    return tags;
  }

  var extract = new Set();
  phrase.children.forEach((child, i, _) => {
    var tags = extractSpectrum(child);
    for (const tag of tags) {
      extract.add(tag);
    }
  });
  return extract;
}

function findTags(phrase) {
  if (!phrase.children) {
    return {};
  }

  if (phrase.symbol === 'singularNounPhrase' || phrase.symbol === 'pluralNounPhrase' || phrase.symbol === 'countableNoun') {
    var tags = extractSpectrum(phrase);
    var res = {}
    res[phrase.finishedText] = [...tags];
    return res;
  }
  var extract = {};
  phrase.children.forEach((child) => {
    var res = findTags(child);
    extract = {...extract, ...res};
  });
  return extract;
}

function converse(tags) {
  var r = [];
  tags.forEach((t, i, _) => {
    spectrumDefinition.forEach((spec, j, _) => {
      if (spec[0] === t) {
        r.push(spec[1]);
      } else if (spec[1] === t) {
        r.push(spec[0]);
      }
    });
  });
  return r;
}

function filter(spec, wordList) {
  return wordList.filter((word) => {
    var tags = new Set(words.data[word]);
    if (tags.has('colorless')) {
      return true;
    }
    for (const s in spec) {
      if (!tags.has(s)) {
        continue;
      }
      if (spec[s] > THRESHOLD) {
        return true;
      }
    }
    return false;
  });
}

function deriveDirections(trace) {
  var tags = findTags(trace);
  var dir = new Set();
  for (const [phrase, tags] of Object.entries(tags)) {
    for (const tag of tags) {
      dir.add(tag);
    }
    var conv = converse(tags);
    for (const tag of conv) {
      dir.add(tag);
    }
  }
  return [...dir];
}

function relevantClauses(trace, tag) {
  var upClauses = [];
  var downClauses = [];
  var colorTags = findTags(trace);
  for (const [phrase, tags] of Object.entries(colorTags)) {
    if (tag === '*') {
      upClauses.push(phrase);
      continue;
    }
    if (tags.includes(tag)) {
      upClauses.push(phrase);
    }
    if (converse(tags).includes(tag)) {
      downClauses.push(phrase);
    }
  }
  return {
    up: upClauses,
    down: downClauses
  };
}

function getHexColor(spectrumTags) {
  var r = 0;
  var y = 0;
  var b = 0;
  /*
  if (spectrumTags['red'] > THRESHOLD) {
    r += spectrumTags['red'];
  }
  if (spectrumTags['green'] > THRESHOLD) {
    y += spectrumTags['green'];
    b += spectrumTags['green'];
  }

  if (spectrumTags['yellow'] > THRESHOLD) {
    y += spectrumTags['yellow'];
  }
  if (spectrumTags['purple'] > THRESHOLD) {
    r += spectrumTags['purple'];
    b += spectrumTags['purple'];
  }

  if (spectrumTags['blue'] > THRESHOLD) {
    b += spectrumTags['blue'];
  }
  if (spectrumTags['orange'] > THRESHOLD) {
    r += spectrumTags['orange'];
    y += spectrumTags['orange'];
  }
  */
  r += spectrumTags['red'];
  y += spectrumTags['green'];
  b += spectrumTags['green'];

  y += spectrumTags['yellow'];
  r += spectrumTags['purple'];
  b += spectrumTags['purple'];

  b += spectrumTags['blue'];
  r += spectrumTags['orange'];
  y += spectrumTags['orange'];

  var max = Math.max(r, y, b);
  //console.log(r + " " + y + " " + b);
  //console.log(spectrumTags);
  //console.log(max);

  return ryb2rgb([
    Math.floor(r / max * 255),
    Math.floor(y / max * 255),
    Math.floor(b / max * 255)
  ]);
}

function getBrightness(spectrumTags) {
  var gray = 255 - Math.floor((spectrumTags['black'] - spectrumTags['white'] + 1) / 2 * 255);
  return [gray, gray, gray]
}

module.exports = {
  'findTags': findTags,
  'converse': converse,
  'move': move,
  'filter': filter,
  'deriveDirections': deriveDirections,
  'relevantClauses': relevantClauses,
  'getHexColor': getHexColor,
  'getBrightness': getBrightness
};
