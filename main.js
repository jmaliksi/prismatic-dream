const tracery = require('tracery-grammar');
const words = require('./words.js');
const spectrum = require('./spectrum.js');

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
  'The #noun# #verb.s#, the #noun# #verb.s#, the #noun# #verb.s#.',
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
  '#dreamSubject.sif#, #singularNounPhrase# #action.ing# #preposition# #nounPhrase#.',
  '#dreamSubject.sif#, #pluralNounPhrase# #action.ing# #preposition# #nounPhrase#.'
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
  'some #countableNoun.s#',
  'many #countableNoun.s#',
  'several #countableNoun.s#',
  'inummerable #countableNoun.s#',
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
  'sadness'
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
  'down',
  //'during',
  'for',
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
  'noun': words.tagTree.noun,
  'nounness': nounness,
  'verb': words.tagTree.verb,
  'preposition': prepositions,
  'subjectClause': subjectClauses,
  'adjective': words.tagTree.adjective,
  'countableNoun': words.taggedBy('noun', 'countable'),
  'uncountableNoun': words.taggedBy('noun', 'uncountable'),
  'singularNounPhrase': singularNounPhrases,
  'pluralNounPhrase': pluralNounPhrases,
  'nounPhrase': ['#singularNounPhrase#', '#pluralNounPhrase#'],
  'dreamAction': dreamAction,
  'dreamSubject': dreamSubject,
  'upVerb': words.taggedBy('verb', 'up'),
  'downVerb': words.taggedBy('verb', 'down')
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

for (var i = 0; i < 25; i++) {
  var gram = {...baseGrammar};
  gram['adjective'] = spectrum.filter(spectrumTags, gram['adjective']);
  gram['noun'] = spectrum.filter(spectrumTags, gram['noun']);
  gram['countableNoun'] = spectrum.filter(spectrumTags, gram['countableNoun']);
  gram['uncountableNoun'] = spectrum.filter(spectrumTags, gram['uncountableNoun']);

  var dreamSequence = '#dreamSequence#';
  if (prevDream) {
    dreamSequence = '#dir.capitalize#. #dreamAction# #dreamSequence#';
    var clauses = spectrum.relevantClauses(prevDream, dir);
    //console.log(clauses);
    var up = (Math.random() * (clauses.up.length + clauses.down.length)) < clauses.up.length;
    gram['action'] = words.taggedBy('verb', up ? 'up' : 'down');
    gram['prevNoun'] = clauses.up.concat(clauses.down);
    gram['dir'] = [dir];
    gram['noun'] = gram['noun'].concat(words.taggedBy('noun', dir));
    gram['countableNoun'] = gram['countableNoun'].concat(words.taggedBy('noun', 'countable', dir));
    gram['uncountableNoun'] = gram['uncountableNoun'].concat(words.taggedBy('noun', 'uncountable', dir));
  }

  var grammar = tracery.createGrammar(gram);
  grammar.addModifiers(mods);

  var dream = grammar.expand(dreamSequence);

  //console.log(spectrumTags);
  console.log(dream.finishedText);

  var dreamTags = spectrum.findTags(dream);
  //console.log(dreamTags);
  var actionTag = new Set();
  for (const [phrase, tags] of Object.entries(dreamTags)) {
    for (const tag of tags) {
      actionTag.add(tag);
    }
    var converse = spectrum.converse(tags);
    for (const tag of converse) {
      actionTag.add(tag);
    }
    //console.log(phrase + ': ' + converse);
  }
  console.log('');

  prevDream = dream;

  actionTag = [...actionTag];
  //console.log(actionTag);
  dir = actionTag[Math.floor(Math.random() * actionTag.length)];
  if (!dir) {
    dir = Math.random() < .5 ? 'black' : 'white';
  }
  //console.log(dir);
  spectrumTags = spectrum.move(spectrumTags, dir);

  //console.log('');
}
