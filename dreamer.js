const tracery = require('tracery-grammar');
const spectrum = require('./spectrum.js');
const words = require('./words.js');

class Dreamer {
  constructor(baseGrammar, mods) {
    this.baseGrammar = baseGrammar;
    this.mods = mods
  }

  dream(spectrumTags, prevDream, dir) {
    var gram = {...this.baseGrammar};
    gram['adjective'] = gram.adjective.concat(spectrum.filter(spectrumTags, gram['adjective']));
    gram['noun'] = spectrum.filter(spectrumTags, gram['noun']);
    gram['countableNoun'] = spectrum.filter(spectrumTags, gram['countableNoun']);
    gram['uncountableNoun'] = spectrum.filter(spectrumTags, gram['uncountableNoun']);

    var dreamSequence = '#dreamSequence#';
    if (prevDream) {
      dreamSequence = '#dir.capitalize#. #dreamAction# #dreamSequence#';
      var clauses = spectrum.relevantClauses(prevDream, dir);
      var up = (Math.random() * (clauses.up.length + clauses.down.length)) < clauses.up.length;
      gram['action'] = words.taggedBy('verb', up ? 'up' : 'down');
      gram['prevNoun'] = clauses.up.concat(clauses.down);
      if (!gram.prevNoun) {
        gram.prevNoun = spectrum.relevantClauses(prevDream, '*').up;
      }
      gram['dir'] = [dir];
      gram['noun'] = gram['noun'].concat(words.taggedBy('noun', dir));
      gram['countableNoun'] = gram['countableNoun'].concat(words.taggedBy('noun', 'countable', dir));
      gram['uncountableNoun'] = gram['uncountableNoun'].concat(words.taggedBy('noun', 'uncountable', dir));
    }

    var grammar = tracery.createGrammar(gram);
    grammar.addModifiers(this.mods);

    return grammar.expand(dreamSequence);
  }
}

module.exports = {
  'Dreamer': Dreamer
};
