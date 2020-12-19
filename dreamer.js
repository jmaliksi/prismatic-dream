const tracery = require('tracery-grammar');
const spectrum = require('./spectrum.js');
const words = require('./words.js');

class Dreamer {
  constructor(baseGrammar, mods) {
    this.baseGrammar = baseGrammar;
    this.mods = mods
  }

  modGrammarForSpectrum(spectrumTags) {
    var gram = {...this.baseGrammar};
    gram['adjective'] = gram.adjective.concat(spectrum.filter(spectrumTags, gram['adjective']));
    gram['noun'] = spectrum.filter(spectrumTags, gram['noun']);
    gram['countableNoun'] = spectrum.filter(spectrumTags, gram['countableNoun']);
    gram['uncountableNoun'] = spectrum.filter(spectrumTags, gram['uncountableNoun']);
    return gram;
  }

  createTrace(grammar) {
    var g = tracery.createGrammar(gram);
    g.addModifiers(this.mods);
    return g;
  }

  dreamPreamble(spectrumTags, prevDream, dir) {
    // return list of traces
    if (!prevDream || !dir) {
      return []
    }

    var gram = this.modGrammarForSpectrum(spectrumTags);
    var clauses = spectrum.relevantClauses(prevDream, dir);
    var seen = new Set();
    var scenes = [];
    var index = -1;
    for (const clause of clauses.up.concat(clauses.down)) {
      if (!clause || seen.has(clause)) {
        continue;
      }
      index += 1;
      seen.add(clause);
      var subject = this.mods.capitalize(clause) + (clauses.up.includes(clause) ? ' #upVerb#' : ' #downVerb#');
      gram['dreamSubject' + index] = subject;
      var actions = []
      for (const a of gram.dreamAction) {
        actions.push(a.replace('dreamSubject', 'dreamSubject' + index));
      }
      gram['dreamAction' + index] = actions;
      scenes.push('#dreamAction' + index + '#');
    }

    return {
      'grammar': gram,
      'symbol': scenes.join(' ')
    }
  }

  dream(spectrumTags, prevDream, dir) {
    var gram = this.modGrammarForSpectrum(spectrumTags);

    var dreamSequence = '#dreamSequence#';
    if (prevDream) {
      gram['dir'] = [dir];
      gram['noun'] = gram['noun'].concat(words.taggedBy('noun', dir));
      gram['countableNoun'] = gram['countableNoun'].concat(words.taggedBy('noun', 'countable', dir));
      gram['uncountableNoun'] = gram['uncountableNoun'].concat(words.taggedBy('noun', 'uncountable', dir));

      var dreamble = this.dreamPreamble(spectrumTags, prevDream, dir);
      gram = {...gram, ...dreamble.grammar};
      dreamSequence = '#dir.capitalize#. ' + dreamble.symbol + ' #dreamSequence#';
    }

    var grammar = tracery.createGrammar(gram);
    grammar.addModifiers(this.mods);

    var d = grammar.expand(dreamSequence);

    return {
      'text': d.finishedText,
      'dream': d
    }
  }
}

module.exports = {
  'Dreamer': Dreamer
};
