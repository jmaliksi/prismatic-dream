const tracery = require('tracery-grammar');
const words = require('./words.js');

var dreamSequences = [
  '#dream#\n #dream#',
  '#dream#\n #dream#\n #dream#',
  '#dream#\n #dream#\n #dream#\n #dream#',
  '#dream#\n #dream#\n #dream#\n #dream#\n #dream#',
];


var dreams = [
  '#subjectClause.capitalize# #preposition# #nounClause.athe#.',
  '#subjectClause.capitalize# #preposition# #nounClause.athe#, #noun.s# #verb.ing# #preposition# the #nounClause#.',
  'There is #nounClause.athe#.',
  'The #nounness# of #nounClause.athe#.',
  '#subjectClause.capitalize#.',
  '#noun.s.capitalize# #verb#, #noun.s# #verb#, #noun.s# #verb#.',
  'Memories of #nounClause.athe#.',
  'Memories of #nounClause.athe#, #verb.ing# #preposition# #nounClause.athe#.',
  '#verb.ing.a.capitalize# #nounClause#.',
  'What #verb.s# #preposition# the #nounClause.s#?'
];

var subjectClauses = [
  '#nounClause.athe# #verb.s#',
  '#nounClause.athe# #verb.s#',
  '#nounClause.s# #verb#',
  'some #nounClause.s# #verb#',
  'many #nounClause.s# #verb#',
  'inummerable #nounClause.s# #verb#'
];

var nounClauses = [
  '#noun#',
  '#adjective# #noun#'
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
  'love'
];

var verbs = [
  'appear',
  'ascend',
  'blink',
  'bloom',
  'coalesce',
  //'consume',
  'crash',
  'creak',
  'crumble',
  'dance',
  'descend',
  'disappear',
  //'divide',
  'drift',
  //'envelope',
  'emanate',
  'fall',
  'falter',
  'float',
  'fly',
  'glide',
  'glow',
  'grow',
  'laugh',
  //'lunge',
  'merge',
  'move',
  'play',
  'rise',
  //'root',
  'rumble',
  'run',
  'scatter',
  'scramble',
  'scribble',
  'set',
  'seep',
  'shake',
  'shatter',
  'shimmer',
  'shiver',
  'shrink',
  'sing',
  'slide',
  'smile',
  'spiral',
  'stand',
  'stare',
  'swirl',
  'tower',
  'trot',
  'twinkle',
  'waft',
  'walk',
  'wave',
  'waver',
  'wink'
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
  'during',
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
  'to',
  'toward',
  'under',
  'up',
  'with'
];

var grammar = tracery.createGrammar({
  'dreamSequence': dreamSequences,
  'dream': dreams,
  'noun': words.tagTree.noun,
  'nounness': nounness,
  'verb': verbs,
  'preposition': prepositions,
  'subjectClause': subjectClauses,
  'nounClause': nounClauses,
  'adjective': words.tagTree.adjective
});
grammar.addModifiers(tracery.baseEngModifiers);

var originalSMod = grammar.modifiers.s;
grammar.modifiers.s = function(s) {
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

grammar.addModifiers({
  'ing': function(s) {
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
  },

  'athe': function(s) {
    var s2 = s.split(' ');
    var word = s2[s2.length - 1];
    var article = 'a';
    if (isCountable(word)) {
      var phrase = s2.slice(0, -1).join(' ');
      phrase += phrase.length > 0 ? ' ' : '';
      phrase += word;
      if (article === 'a') {
        return grammar.modifiers.a(phrase);
      }
      return 'the ' + phrase;
    }
    return s;
  }
});

function isCountable(word) {
  return words.hasTag(word, 'countable');
}

for (var i = 0; i < 25; i++) {
  console.log(grammar.flatten('#dreamSequence#'));
  console.log('');
}