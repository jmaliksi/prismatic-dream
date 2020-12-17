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
  'purple'
];

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

module.exports = {
  'findTags': findTags
};
