var tracery = require('tracery-grammar');

/*
var grammar = tracery.createGrammar({
  'origin': ['Hello #thing#.'],
  'thing': ['world', 'borld', 'you']
});
grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
*/


var dreams = [
  '#subjectClause.capitalize# #preposition# #nounClause.a#.',
  '#subjectClause.capitalize# #preposition# #nounClause.a#, #noun.s# #verbing# #preposition# the #nounClause#.',
  'There is #nounClause.a#.',
  'The #nounness# of #nounClause.a#.',
  '#subjectClause.capitalize#.',
  '#noun.s.capitalize# #verb#, #noun.s# #verb#, #noun.s# #verb#.'
];

var subjectClauses = [
  'the #nounClause# #verb.s#',
  '#nounClause.a# #verb.s#',
  '#nounClause.s# #verb#',
  'some #nounClause.s# #verb#',
  'several #nounClause.s# #verb#',
  'many #nounClause.s# #verb#',
  'inummerable #nounClause.s# #verb#',
];

var nounClauses = [
  '#noun#',
  '#adjective# #noun#'
];

var adjectives = [
  'cold',
  'dark',
  'bright',
  'burning',
  'forgotten',
  'distant',
  'hazy',
  'lost',
  'setting',
  'second',
  'hot',
  'smooth',
  'remarkable',
  'forlorn',
  'imposing',
  'consuming',
  'restless',
  'old',
  'unknown',
  'faceless',
  'laughing',
  'featureless',
  'shifting',
  'fleeting',
  'stonelike',
  'marble',
  'melting'
];

var nouns = [
  'sun',
  'city',
  'thunderhead',
  'cloud',
  'tree',
  'sun',
  'friend',
  'love',
  'bird',
  'laughter',
  'canopy',
  'forest',
  'ground',
  'volcano',
  'dog',
  'mouse',
  'man',
  'woman',
  'child',
  'moment',
  'carving',
  'pen',
  'sword',
  'mountain',
  'rose',
  'pendant',
  'desk',
  'chair',
  'car'
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
];

var verbs = [
  'stand',
  'swirl',
  'rise',
  'shiver',
  'set',
  'drift',
  'fall',
  'bloom',
  'smile',
  'laugh',
  'move',
  'lunge',
  'fly',
  'glide',
  'scatter',
  'appear',
  'disappear',
  'blink',
  'crumble',
  'grow',
  'falter',
  'shrink',
  'consume',
  'merge',
  'divide',
  'dance',
  'twinkle',
  'shimmer',
  'shake',
  'glow'
];

var verbing = [
  'standing',
  'swirling',
  'rising',
  'shivering',
  'setting',
  'drifting',
  'falling',
  'blooming',
  'creaking',
  'singing',
  'laughing',
  'emanating'
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
  'between',
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
  'dream': dreams,
  'noun': nouns,
  'nounness': nounness,
  'verb': verbs,
  'preposition': prepositions,
  'verbing': verbing,
  'subjectClause': subjectClauses,
  'nounClause': nounClauses,
  'adjective': adjectives
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
  if (s.length >= 3 && s.slice(-3) === 'man') {
    return s.slice(0, -3) + 'men';
  }
  return originalSMod(s);
};

for (var i = 0; i < 25; i++) {
  console.log(grammar.flatten('#dream#'));
}
