const tracery = require('tracery-grammar');
const words = require('./words.js');
const spectrum = require('./spectrum.js');
const dreamer = require('./dreamer.js');

var dreamSequences = [
  '#dream# #dream#',
  '#dream# #dream# #dream#',
  '#dream# #dream# #dream# #dream#',
  //'#dream#\n #dream#\n #dream#\n #dream#\n #dream#',
];

var dreams = [
  '#subjectClause.capitalize# #preposition# #nounPhrase#.',
  '#subjectClause.capitalize# #preposition# #nounPhrase#, #noun.s# #verb.ing# #preposition# #nounPhrase#.',
  '#subjectClause.capitalize# #preposition# #nounPhrase#, #noun.s# #verb.ing# #preposition# #nounPhrase#.',
  'There is #singularNounPhrase#.',
  'There are #pluralNounPhrase#.',
  'The #nounness# of #nounPhrase#.',
  '#subjectClause.capitalize#.',
  '#countableNoun.s.capitalize# #verb#, #countableNoun.s# #verb#, #countableNoun.s# #verb#.',
  //'The #noun# #verb.s#, the #noun# #verb.s#, the #noun# #verb.s#.',
  'Memories of #nounPhrase#.',
  'Memories of #nounPhrase#, #verb.ing# #preposition# #nounPhrase#.',
  '#verb.ing.a.capitalize# #adjective# #countableNoun#.',
  'What #verb.s# #preposition# #nounPhrase#?'
];

var dreamSubject = ['#prevNoun.capitalize# #action#'];

var dreamAction = [
  '#dreamSubject.sif#.',
  '#dreamSubject.sif#.',
  '#dreamSubject.sif# #preposition# #nounPhrase#.',
  '#dreamSubject.sif# #preposition# #nounPhrase#.',
  //'#dreamSubject.sif#, #singularNounPhrase# #verb.ing# #preposition# #nounPhrase#.',
  //'#dreamSubject.sif#, #pluralNounPhrase# #verb.ing# #preposition# #nounPhrase#.'
]

var relationship = [
  '#relationAdjective# #relation#',
]

var subjectClauses = [
  '#singularNounPhrase# #verb.s#',
  '#pluralNounPhrase# #verb#'
];

var singularNounPhrases = [
  '#uncountableNoun#',
  '#uncountableNoun#',
  //'#adjective# #uncountableNoun#',
  'the #noun#',
  'the #noun#',
  'the #adjective# #noun#',
  'the #adjective# #noun#',
  '#countableNoun.a#',
  '#countableNoun.a#',
  '#adjective.a# #noun#',
  '#adjective.a# #noun#',
  'some #uncountableNoun#',
  'some #adjective# #uncountableNoun#'
];

var pluralNounPhrases = [
  '#countableNoun.s#',
  '#adjective# #countableNoun.s#',
  '#countableNoun.s#',
  '#adjective# #countableNoun.s#',
  '#countableNoun.s#',
  '#adjective# #countableNoun.s#',
  'some #countableNoun.s#',
  'a few #countableNoun.s#',
  'many #countableNoun.s#',
  'several #countableNoun.s#',
  'inummerable #countableNoun.s#',
  'countless #countableNoun.s#',
];

var nounness = [
  'coldness',
  'sweetness',
  'fickleness',
  'serenity',
  'quietness',
  'warmth',
  'heat',
  'brightness',
  'darkness',
  'quiet',
  'rage',
  'passion',
  'love',
  'sadness',
  'wisdom',
  'folly'
];

var prepositions = [
  'about',
  'above',
  'across',
  'after',
  'against',
  'among',
  'around',
  'at',
  'before',
  'behind',
  'below',
  'beside',
  //'between',
  'by',
  //'down',
  //'during',
  //'for',
  'from',
  'in',
  'inside',
  'into',
  'near',
  'off',
  'on',
  'out of',
  'over',
  'through',
  //'to',
  'toward',
  'under',
  //'up',
  'with'
];

var baseGrammar = {
  'dreamSequence': dreamSequences,
  'dream': dreams,
  'noun': words.tagTree.noun.concat(relationship),
  'nounness': nounness,
  'verb': words.tagTree.verb,
  'preposition': prepositions,
  'subjectClause': subjectClauses,
  'adjective': words.tagTree.adjective,
  'countableNoun': words.taggedBy('noun', 'countable').concat(relationship),
  'uncountableNoun': words.taggedBy('noun', 'uncountable'),
  'singularNounPhrase': singularNounPhrases,
  'pluralNounPhrase': pluralNounPhrases,
  'nounPhrase': ['#singularNounPhrase#', '#pluralNounPhrase#'],
  'dreamAction': dreamAction,
  'dreamSubject': dreamSubject,
  'upVerb': words.taggedBy('verb', 'up'),
  'downVerb': words.taggedBy('verb', 'down'),
  'relationAdjective': words.taggedBy('adjective', 'relational'),
  'relation': words.taggedBy('relation')
};

var mods = {...tracery.baseEngModifiers};
var originalSMod = mods.s;
mods.s = function(s) {
  if (s.slice(-5) === 'child') {
    return s.slice(0, -5) + 'children';
  }
  if (s.slice(-5) === 'mouse') {
    return s.slice(0, -5) + 'mice';
  }
  if (s.slice(-5) === 'laugh') {
    return s.slice(0, -5) + 'laughs';
  }
  if (s.length >= 3 && s.slice(-3) === 'man') {
    return s.slice(0, -3) + 'men';
  }
  if (s.length >= 6 && s.slice(-6) === 'tomato') {
    return s.slice(0, -6) + 'tomatoes';
  }
  if (s.length >= 5 && s.slice(-5) === 'knife') {
    return s.slice(0, -5) + 'knives';
  }
  if (s.length >= 6 && s.slice(-6) === 'person') {
    return s.slice(0, -6) + 'people';
  }
  return originalSMod(s);
};
mods.ing = function(s) {
  if (s.charAt(s.length - 1) === 'e') {
    return s.slice(0, -1) + 'ing';
  }
  else if (s.slice(-3) === 'set') {
    return s.slice(0, -3) + 'setting';
  }
  else if (s.slice(-3) === 'run') {
    return s.slice(0, -3) + 'running';
  }
  return s + 'ing';
}
mods.sif = function(s) {
  s2 = s.split(" ");
  var noun = s2[s2.length - 2];
  if (noun[noun.length - 1] !== 's') {
    return mods.s(s);
  }
  return s;
}


const readline = require('readline');

var spectrumTags = {
  'black': 0.5,
  'white': 0.5,
  'red': 0.5,
  'green': 0.5,
  'blue': 0.5,
  'orange': 0.5,
  'yellow': 0.5,
  'purple': 0.5
};
var prevDream;
var dir;
var sleeper = new dreamer.Dreamer(baseGrammar, mods);

function dreaming() {
  console.log('');
  var d = sleeper.dream(spectrumTags, prevDream, dir);
  console.log(d.text);
  prevDream = d.dream;
  rl.setPrompt("> ");
  rl.prompt();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on('line', (ans) => {
  dir = ans;
  spectrumTags = spectrum.move(spectrumTags, dir);
  dreaming();
});

dreaming();
