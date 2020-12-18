const words = require('./words.js');

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

function move(spec, direction) {
  var copy = {...spec};
  var conv = converse([direction])[0];
  for (const k in copy) {
    copy[k] = copy[k] * .8;
  }
  copy[direction] = 1.0;
  copy[conv] = 0.0;
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

  if (phrase.symbol === 'singularNounPhrase' || phrase.symbol === 'pluralNounPhrase') {
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
      if (spec[s] > 0.1) {
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

module.exports = {
  'findTags': findTags,
  'converse': converse,
  'move': move,
  'filter': filter,
  'deriveDirections': deriveDirections,
  'relevantClauses': relevantClauses
};
