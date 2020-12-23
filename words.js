const data = require('./words.json');
const tracery = require('tracery-grammar');

function hasTag(word, tag) {
  if (!data[word]) {
    return false;
  }
  return data[word].includes(tag);
}

function createTreeTag(d) {
  var tree = {};

  for (const [word, tags] of Object.entries(d)) {
    tags.forEach((tag, i, _) => {
      if (!tree[tag]) {
        tree[tag] = [];
      }
      tree[tag].push(word);
    });
  }

  return tree;
}

const tagTree = createTreeTag(data)

function stats(tree) {
  for (const [tag, words] of Object.entries(tree)) {
    console.log(tag + ': ' + words.length);
  }
}

function taggedBy(...tags) {
  var words = [];
  for (const [word, desc] of Object.entries(data)) {
    var has = true;
    for (const tag of tags) {
      has = has && desc.includes(tag);
    }
    if (has) {
      words.push(word);
    }
  }
  return words;
}

//stats(tagTree);
//console.log(taggedBy('noun', 'uncountable'));
var dreamSequences = [
  '#dream# #dream#',
  '#dream# #dream# #dream#',
  //'#dream# #dream# #dream# #dream#',
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
  '#describedNoun.capitalize#.',
  'What #verb.s# #preposition# #pluralNounPhrase#?',
  'What #verb.s# #preposition# #singularNounPhrase#?'
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
  '#uncountableNoun#',
  '#uncountableNoun#',
  //'#adjective# #uncountableNoun#',
  //'the #noun#',
  //'the #noun#',
  //'the #adjective# #noun#',
  //'the #adjective# #noun#',
  '#countableNoun.a#',
  '#countableNoun.a#',
  '#countableNoun.a#',
  '#countableNoun.a#',
  '#adjective.a# #noun#',
  '#adjective.a# #noun#',
  '#adjective.a# #noun#',
  '#adjective.a# #noun#',
  'some #uncountableNoun#',
  'some #adjective# #uncountableNoun#',
  'some #uncountableNoun#',
  'some #adjective# #uncountableNoun#',
  '#relationship.a#',
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

var baseGrammar = {
  'dreamSequence': dreamSequences,
  'dream': dreams,
  'noun': tagTree.noun,
  'nounness': tagTree.nounness,
  'verb': tagTree.verb,
  'preposition': tagTree.preposition,
  'subjectClause': subjectClauses,
  'adjective': tagTree.adjective,
  'countableNoun': taggedBy('noun', 'countable'),
  'uncountableNoun': taggedBy('noun', 'uncountable'),
  'singularNounPhrase': singularNounPhrases,
  'pluralNounPhrase': pluralNounPhrases,
  'nounPhrase': ['#singularNounPhrase#', '#pluralNounPhrase#'],
  'dreamAction': dreamAction,
  'dreamSubject': dreamSubject,
  'upVerb': taggedBy('verb', 'up'),
  'downVerb': taggedBy('verb', 'down'),
  'relationAdjective': taggedBy('adjective', 'relational'),
  'relation': tagTree.relation,
  'describedNoun': '#verb.ing.a# #adjective# #countableNoun#',
  'relationship': relationship
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
  if (s.charAt(s.length - 1) === 'z') {
    return s + 'es';
  }
  if (s.length >= 9 && s.slice(-9) === 'lightning') {
    return s.slice(0, -9) + 'lightning';
  }
  if (s.length >= 8 && s.slice(-8) === 'savannah') {
    return s.slice(0, -8) + 'savannahs';
  }
  if (s.length >= 4 && s.slice(-4) === 'corn') {
    return s.slice(0, -4) + 'corn';
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
  else if (s.slice(-4) === 'drop') {
    return s.slice(0, -4) + 'dropping';
  }
  else if (s.slice(-4) === 'drop') {
    return s.slice(0, -4) + 'dropping';
  }
  else if (s.slice(-3) === 'cut') {
    return s.slice(0, -3) + 'cutting';
  }
  else if (s.slice(-4) === 'trot') {
    return s.slice(0, -4) + 'trotting';
  }
  else if (s.slice(-2) === 'um') {
    return s.slice(0, -2) + 'umming';
  }
  return s + 'ing';
}
mods.sif = function(s) {
  s2 = s.split(" ");
  var noun = s2[s2.length - 2];
  switch (noun) {
    case 'mice': return s;
    case 'corn': return s;
    case 'hyacinth': return 'hyacinths';
    case 'froth': return 'froths';
    case 'albatross':
    case 'grass': return mod.s(s);
  }
  if (noun[noun.length - 1] !== 's') {
    return mods.s(s);
  }
  return s;
}

module.exports = {
  'tagTree': tagTree,
  'data': data,
  'hasTag': hasTag,
  'taggedBy': taggedBy,
  'baseGrammar': baseGrammar,
  'mods': mods
};
