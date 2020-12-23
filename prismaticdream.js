(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.prismaticdream = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const words = require('./words.js');
const spectrum = require('./spectrum.js');
const dreamer = require('./dreamer.js');

var spectrumTags = {
  'black': Math.random() * .5,
  'white': Math.random() * .5,
  'red': Math.random() * .5,
  'green': Math.random() * .5,
  'blue': Math.random() * .5,
  'orange': Math.random() * .5,
  'yellow': Math.random() * .5,
  'purple': Math.random() * .5
};
var prevDream;
var dir;
var sleeper = new dreamer.Dreamer(words.baseGrammar, words.mods);

var inColor;
var outColor;
var textColor = '#000';

function dreaming() {
  var d = sleeper.dream(spectrumTags, prevDream, dir);
  prevDream = d.dream;
  return d.text;
}

function dream(d) {
  dir = d;

  spectrumTags = spectrum.move(spectrumTags, dir);
  console.log(spectrumTags);
  var d = dreaming();
  setBgColor();
  setTextColor();
  
  const dreamText = document.getElementById('dreamText');
  dreamText.textContent = d;
}

function getBgColor(st) {
  const c1 = spectrum.getHexColor(spectrumTags);
  const c2 = spectrum.getBrightness(spectrumTags);
  const avg = (c1[0] + c1[1] + c1[2]) / 3;

  if (avg < 170) {
    return [c2, c1];
  }
  return [c1, c2];
}

function setOverlayColor() {
  if (!inColor || !outColor) {
    const c = getBgColor(spectrumTags);
    inColor = c[0];
    outColor = c[1];
  }

  const dreamOverlay = document.getElementById('dreamOverlay');
  dreamOverlay.style.setProperty('--outColor0', `rgb(${outColor[0]},${outColor[1]},${outColor[2]})`);
  dreamOverlay.style.setProperty('--inColor0', `rgb(${inColor[0]},${inColor[1]},${inColor[2]})`);
  dreamOverlay.classList.remove('fadeOut');
  void dreamOverlay.offsetWidth;
  dreamOverlay.classList.add('fadeOut');

}

function setBgColor() {
  setOverlayColor();
  const c = getBgColor(spectrumTags);
  inColor = c[0];
  outColor = c[1];
  const dreamBox = document.getElementById('dream');
  dreamBox.style.setProperty('--outColor', `rgb(${outColor[0]},${outColor[1]},${outColor[2]})`);
  dreamBox.style.setProperty('--inColor', `rgb(${inColor[0]},${inColor[1]},${inColor[2]})`);
  const body = document.getElementById('body');
  body.style.setProperty('--outColor', `rgb(${outColor[0]},${outColor[1]},${outColor[2]})`);
}

function setTextColor() {
  const text = document.getElementById('dreamText');
  const avg = (inColor[0] * 2 + inColor[1] * 2 + inColor[2] * 2 +
    outColor[0] + outColor[1] + outColor[2]) / 9;
  if (avg < 128) {
    textColor = '#fff';
  } else {
    textColor = '#000';
  }
  text.style.setProperty('--textColor', textColor);
}

function initDream() {
  const dreamText = document.getElementById('dreamText');
  setOverlayColor();
  setBgColor();
  setTextColor();
  dreamText.textContent = dreaming();
}

module.exports = {
  'spectrumTags': spectrumTags,
  'dreaming': dreaming,
  'dream': dream,
  'initDream': initDream
}

},{"./dreamer.js":2,"./spectrum.js":5,"./words.js":7}],2:[function(require,module,exports){
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
    while (scenes.length > 3) {
      const idx = Math.floor(Math.random() * scenes.length);
      scenes = scenes.splice(0, idx).concat(scenes.splice(idx + 1));
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

},{"./spectrum.js":5,"./words.js":7,"tracery-grammar":4}],3:[function(require,module,exports){
/**
 * Original Work
 * http://www.paintassistant.com/rybrgb.html
 * Modified by Dave Eddy <dave@daveeddy.com>
 */

;(function() {
  function cubicInt(t, A, B){
    var weight = t*t*(3-2*t);
    return A + weight*(B-A);
  }

  function getR(iR, iY, iB) {
    // red
    var x0 = cubicInt(iB, 1.0, 0.163);
    var x1 = cubicInt(iB, 1.0, 0.0);
    var x2 = cubicInt(iB, 1.0, 0.5);
    var x3 = cubicInt(iB, 1.0, 0.2);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil (255 * cubicInt(iR, y0, y1));
  }

  function getG(iR, iY, iB) {
    // green
    var x0 = cubicInt(iB, 1.0, 0.373);
    var x1 = cubicInt(iB, 1.0, 0.66);
    var x2 = cubicInt(iB, 0.0, 0.0);
    var x3 = cubicInt(iB, 0.5, 0.094);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil (255 * cubicInt(iR, y0, y1));
  }

  function getB(iR, iY, iB) {
    // blue
    var x0 = cubicInt(iB, 1.0, 0.6);
    var x1 = cubicInt(iB, 0.0, 0.2);
    var x2 = cubicInt(iB, 0.0, 0.5);
    var x3 = cubicInt(iB, 0.0, 0.0);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil (255 * cubicInt(iR, y0, y1));
  }

  function ryb2rgb(color){
    var R = color[0] / 255;
    var Y = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR(R,Y,B) ;
    var G1 = getG(R,Y,B) ;
    var B1 = getB(R,Y,B) ;
    var ret = [ R1, G1, B1 ];
    return ret;
  }

  // export
  if (typeof module !== 'undefined') {
    module.exports = ryb2rgb;
  } else {
    window.ryb2rgb = ryb2rgb;
  }
})();

},{}],4:[function(require,module,exports){
/**
 * @author Kate
 */

var tracery = function() {

    var TraceryNode = function(parent, childIndex, settings) {
        this.errors = [];

        // No input? Add an error, but continue anyways
        if (settings.raw === undefined) {
            this.errors.push("Empty input for node");
            settings.raw = "";
        }

        // If the root node of an expansion, it will have the grammar passed as the 'parent'
        //  set the grammar from the 'parent', and set all other values for a root node
        if ( parent instanceof tracery.Grammar) {
            this.grammar = parent;
            this.parent = null;
            this.depth = 0;
            this.childIndex = 0;
        } else {
            this.grammar = parent.grammar;
            this.parent = parent;
            this.depth = parent.depth + 1;
            this.childIndex = childIndex;
        }

        this.raw = settings.raw;
        this.type = settings.type;
        this.isExpanded = false;

        if (!this.grammar) {
            this.errors.push("No grammar specified for this node " + this);
        }

    };

    TraceryNode.prototype.toString = function() {
        return "Node('" + this.raw + "' " + this.type + " d:" + this.depth + ")";
    };

    // Expand the node (with the given child rule)
    //  Make children if the node has any
    TraceryNode.prototype.expandChildren = function(childRule, preventRecursion) {
        this.children = [];
        this.finishedText = "";

        // Set the rule for making children,
        // and expand it into section
        this.childRule = childRule;
        if (this.childRule !== undefined) {
            var sections = tracery.parse(childRule);

            // Add errors to this
            if (sections.errors.length > 0) {
                this.errors = this.errors.concat(sections.errors);

            }

            for (var i = 0; i < sections.length; i++) {
                this.children[i] = new TraceryNode(this, i, sections[i]);
                if (!preventRecursion)
                    this.children[i].expand(preventRecursion);

                // Add in the finished text
                this.finishedText += this.children[i].finishedText;
            }
        } else {
            // In normal operation, this shouldn't ever happen
            this.errors.push("No child rule provided, can't expand children");
        }
    };

    // Expand this rule (possibly creating children)
    TraceryNode.prototype.expand = function(preventRecursion) {

        if (!this.isExpanded) {
            this.isExpanded = true;

            this.expansionErrors = [];

            // Types of nodes
            // -1: raw, needs parsing
            //  0: Plaintext
            //  1: Tag ("#symbol.mod.mod2.mod3#" or "#[pushTarget:pushRule]symbol.mod")
            //  2: Action ("[pushTarget:pushRule], [pushTarget:POP]", more in the future)

            switch(this.type) {
            // Raw rule
            case -1:

                this.expandChildren(this.raw, preventRecursion);
                break;

            // plaintext, do nothing but copy text into finsihed text
            case 0:
                this.finishedText = this.raw;
                break;

            // Tag
            case 1:
                // Parse to find any actions, and figure out what the symbol is
                this.preactions = [];
                this.postactions = [];

                var parsed = tracery.parseTag(this.raw);

                // Break into symbol actions and modifiers
                this.symbol = parsed.symbol;
                this.modifiers = parsed.modifiers;

                // Create all the preactions from the raw syntax
                for (var i = 0; i < parsed.preactions.length; i++) {
                    this.preactions[i] = new NodeAction(this, parsed.preactions[i].raw);
                }
                for (var i = 0; i < parsed.postactions.length; i++) {
                    //   this.postactions[i] = new NodeAction(this, parsed.postactions[i].raw);
                }

                // Make undo actions for all preactions (pops for each push)
                for (var i = 0; i < this.preactions.length; i++) {
                    if (this.preactions[i].type === 0)
                        this.postactions.push(this.preactions[i].createUndo());
                }

                // Activate all the preactions
                for (var i = 0; i < this.preactions.length; i++) {
                    this.preactions[i].activate();
                }

                this.finishedText = this.raw;

                // Expand (passing the node, this allows tracking of recursion depth)

                var selectedRule = this.grammar.selectRule(this.symbol, this, this.errors);

                this.expandChildren(selectedRule, preventRecursion);

                // Apply modifiers
                // TODO: Update parse function to not trigger on hashtags within parenthesis within tags,
                //   so that modifier parameters can contain tags "#story.replace(#protagonist#, #newCharacter#)#"
                for (var i = 0; i < this.modifiers.length; i++) {
                    var modName = this.modifiers[i];
                    var modParams = [];
                    if (modName.indexOf("(") > 0) {
                        var regExp = /\(([^)]+)\)/;

                        // Todo: ignore any escaped commas.  For now, commas always split
                        var results = regExp.exec(this.modifiers[i]);
                        if (!results || results.length < 2) {
                        } else {
                            var modParams = results[1].split(",");
                            modName = this.modifiers[i].substring(0, modName.indexOf("("));
                        }

                    }

                    var mod = this.grammar.modifiers[modName];

                    // Missing modifier?
                    if (!mod) {
                        this.errors.push("Missing modifier " + modName);
                        this.finishedText += "((." + modName + "))";
                    } else {
                        this.finishedText = mod(this.finishedText, modParams);

                    }

                }

                // Perform post-actions
                for (var i = 0; i < this.postactions.length; i++) {
                    this.postactions[i].activate();
                }
                break;
            case 2:

                // Just a bare action?  Expand it!
                this.action = new NodeAction(this, this.raw);
                this.action.activate();

                // No visible text for an action
                // TODO: some visible text for if there is a failure to perform the action?
                this.finishedText = "";
                break;

            }

        } else {
            //console.warn("Already expanded " + this);
        }

    };

    TraceryNode.prototype.clearEscapeChars = function() {

        this.finishedText = this.finishedText.replace(/\\\\/g, "DOUBLEBACKSLASH").replace(/\\/g, "").replace(/DOUBLEBACKSLASH/g, "\\");
    };

    // An action that occurs when a node is expanded
    // Types of actions:
    // 0 Push: [key:rule]
    // 1 Pop: [key:POP]
    // 2 function: [functionName(param0,param1)] (TODO!)
    function NodeAction(node, raw) {
        /*
         if (!node)
         console.warn("No node for NodeAction");
         if (!raw)
         console.warn("No raw commands for NodeAction");
         */

        this.node = node;

        var sections = raw.split(":");
        this.target = sections[0];

        // No colon? A function!
        if (sections.length === 1) {
            this.type = 2;

        }

        // Colon? It's either a push or a pop
        else {
            this.rule = sections[1];
            if (this.rule === "POP") {
                this.type = 1;
            } else {
                this.type = 0;
            }
        }
    }


    NodeAction.prototype.createUndo = function() {
        if (this.type === 0) {
            return new NodeAction(this.node, this.target + ":POP");
        }
        // TODO Not sure how to make Undo actions for functions or POPs
        return null;
    };

    NodeAction.prototype.activate = function() {
        var grammar = this.node.grammar;
        switch(this.type) {
        case 0:
            // split into sections (the way to denote an array of rules)
            this.ruleSections = this.rule.split(",");
            this.finishedRules = [];
            this.ruleNodes = [];
            for (var i = 0; i < this.ruleSections.length; i++) {
                var n = new TraceryNode(grammar, 0, {
                    type : -1,
                    raw : this.ruleSections[i]
                });

                n.expand();

                this.finishedRules.push(n.finishedText);
            }

            // TODO: escape commas properly
            grammar.pushRules(this.target, this.finishedRules, this);
            break;
        case 1:
            grammar.popRules(this.target);
            break;
        case 2:
            grammar.flatten(this.target, true);
            break;
        }

    };

    NodeAction.prototype.toText = function() {
        switch(this.type) {
        case 0:
            return this.target + ":" + this.rule;
        case 1:
            return this.target + ":POP";
        case 2:
            return "((some function))";
        default:
            return "((Unknown Action))";
        }
    };

    // Sets of rules
    // Can also contain conditional or fallback sets of rulesets)
    function RuleSet(grammar, raw) {
        this.raw = raw;
        this.grammar = grammar;
        this.falloff = 1;

        if (Array.isArray(raw)) {
            this.defaultRules = raw;
        } else if ( typeof raw === 'string' || raw instanceof String) {
            this.defaultRules = [raw];
        } else if (raw === 'object') {
            // TODO: support for conditional and hierarchical rule sets
        }

    };

    RuleSet.prototype.selectRule = function(errors) {
        // console.log("Get rule", this.raw);
        // Is there a conditional?
        if (this.conditionalRule) {
            var value = this.grammar.expand(this.conditionalRule, true);
            // does this value match any of the conditionals?
            if (this.conditionalValues[value]) {
                var v = this.conditionalValues[value].selectRule(errors);
                if (v !== null && v !== undefined)
                    return v;
            }
            // No returned value?
        }

        // Is there a ranked order?
        if (this.ranking) {
            for (var i = 0; i < this.ranking.length; i++) {
                var v = this.ranking.selectRule();
                if (v !== null && v !== undefined)
                    return v;
            }

            // Still no returned value?
        }

        if (this.defaultRules !== undefined) {
            var index = 0;
            // Select from this basic array of rules

            // Get the distribution from the grammar if there is no other
            var distribution = this.distribution;
            if (!distribution)
                distribution = this.grammar.distribution;

            switch(distribution) {
            case "shuffle":

                // create a shuffle desk
                if (!this.shuffledDeck || this.shuffledDeck.length === 0) {
                    // make an array
                    this.shuffledDeck = fyshuffle(Array.apply(null, {
                        length : this.defaultRules.length
                    }).map(Number.call, Number), this.falloff);

                }

                index = this.shuffledDeck.pop();

                break;
            case "weighted":
                errors.push("Weighted distribution not yet implemented");
                break;
            case "falloff":
                errors.push("Falloff distribution not yet implemented");
                break;
            default:

                index = Math.floor(Math.pow(Math.random(), this.falloff) * this.defaultRules.length);
                break;
            }

            if (!this.defaultUses)
                this.defaultUses = [];
            this.defaultUses[index] = ++this.defaultUses[index] || 1;
            return this.defaultRules[index];
        }

        errors.push("No default rules defined for " + this);
        return null;

    };

    RuleSet.prototype.clearState = function() {

        if (this.defaultUses) {
            this.defaultUses = [];
        }
    };

    function fyshuffle(array, falloff) {
        var currentIndex = array.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    var Symbol = function(grammar, key, rawRules) {
        // Symbols can be made with a single value, and array, or array of objects of (conditions/values)
        this.key = key;
        this.grammar = grammar;
        this.rawRules = rawRules;

        this.baseRules = new RuleSet(this.grammar, rawRules);
        this.clearState();

    };

    Symbol.prototype.clearState = function() {

        // Clear the stack and clear all ruleset usages
        this.stack = [this.baseRules];

        this.uses = [];
        this.baseRules.clearState();
    };

    Symbol.prototype.pushRules = function(rawRules) {
        var rules = new RuleSet(this.grammar, rawRules);
        this.stack.push(rules);
    };

    Symbol.prototype.popRules = function() {
        this.stack.pop();
    };

    Symbol.prototype.selectRule = function(node, errors) {
        this.uses.push({
            node : node
        });

        if (this.stack.length === 0) {
            errors.push("The rule stack for '" + this.key + "' is empty, too many pops?");
            return "((" + this.key + "))";
        }

        return this.stack[this.stack.length - 1].selectRule();
    };

    Symbol.prototype.getActiveRules = function() {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack[this.stack.length - 1].selectRule();
    };

    Symbol.prototype.rulesToJSON = function() {
        return JSON.stringify(this.rawRules);
    };

    var Grammar = function(raw, settings) {
        this.modifiers = {};
        this.loadFromRawObj(raw);
    };

    Grammar.prototype.clearState = function() {
        var keys = Object.keys(this.symbols);
        for (var i = 0; i < keys.length; i++) {
            this.symbols[keys[i]].clearState();
        }
    };

    Grammar.prototype.addModifiers = function(mods) {

        // copy over the base modifiers
        for (var key in mods) {
            if (mods.hasOwnProperty(key)) {
                this.modifiers[key] = mods[key];
            }
        };

    };

    Grammar.prototype.loadFromRawObj = function(raw) {

        this.raw = raw;
        this.symbols = {};
        this.subgrammars = [];

        if (this.raw) {
            // Add all rules to the grammar
            for (var key in this.raw) {
                if (this.raw.hasOwnProperty(key)) {
                    this.symbols[key] = new Symbol(this, key, this.raw[key]);
                }
            }
        }
    };

    Grammar.prototype.createRoot = function(rule) {
        // Create a node and subnodes
        var root = new TraceryNode(this, 0, {
            type : -1,
            raw : rule,
        });

        return root;
    };

    Grammar.prototype.expand = function(rule, allowEscapeChars) {
        var root = this.createRoot(rule);
        root.expand();
        if (!allowEscapeChars)
            root.clearEscapeChars();

        return root;
    };

    Grammar.prototype.flatten = function(rule, allowEscapeChars) {
        var root = this.expand(rule, allowEscapeChars);

        return root.finishedText;
    };

    Grammar.prototype.toJSON = function() {
        var keys = Object.keys(this.symbols);
        var symbolJSON = [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            symbolJSON.push(' "' + key + '" : ' + this.symbols[key].rulesToJSON());
        }
        return "{\n" + symbolJSON.join(",\n") + "\n}";
    };

    // Create or push rules
    Grammar.prototype.pushRules = function(key, rawRules, sourceAction) {

        if (this.symbols[key] === undefined) {
            this.symbols[key] = new Symbol(this, key, rawRules);
            if (sourceAction)
                this.symbols[key].isDynamic = true;
        } else {
            this.symbols[key].pushRules(rawRules);
        }
    };

    Grammar.prototype.popRules = function(key) {
        if (!this.symbols[key])
            this.errors.push("Can't pop: no symbol for key " + key);
        this.symbols[key].popRules();
    };

    Grammar.prototype.selectRule = function(key, node, errors) {
        if (this.symbols[key]) {
            var rule = this.symbols[key].selectRule(node, errors);

            return rule;
        }

        // Failover to alternative subgrammars
        for (var i = 0; i < this.subgrammars.length; i++) {

            if (this.subgrammars[i].symbols[key])
                return this.subgrammars[i].symbols[key].selectRule();
        }

        // No symbol?
        errors.push("No symbol for '" + key + "'");
        return "((" + key + "))";
    };

    // Parses a plaintext rule in the tracery syntax
    tracery = {

        createGrammar : function(raw) {
            return new Grammar(raw);
        },

        // Parse the contents of a tag
        parseTag : function(tagContents) {

            var parsed = {
                symbol : undefined,
                preactions : [],
                postactions : [],
                modifiers : []
            };
            var sections = tracery.parse(tagContents);
            var symbolSection = undefined;
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].type === 0) {
                    if (symbolSection === undefined) {
                        symbolSection = sections[i].raw;
                    } else {
                        throw ("multiple main sections in " + tagContents);
                    }
                } else {
                    parsed.preactions.push(sections[i]);
                }
            }

            if (symbolSection === undefined) {
                //   throw ("no main section in " + tagContents);
            } else {
                var components = symbolSection.split(".");
                parsed.symbol = components[0];
                parsed.modifiers = components.slice(1);
            }
            return parsed;
        },

        parse : function(rule) {
            var depth = 0;
            var inTag = false;
            var sections = [];
            var escaped = false;

            var errors = [];
            var start = 0;

            var escapedSubstring = "";
            var lastEscapedChar = undefined;

            if (rule === null) {
                var sections = [];
                sections.errors = errors;

                return sections;
            }

            function createSection(start, end, type) {
                if (end - start < 1) {
                    if (type === 1)
                        errors.push(start + ": empty tag");
                    if (type === 2)
                        errors.push(start + ": empty action");

                }
                var rawSubstring;
                if (lastEscapedChar !== undefined) {
                    rawSubstring = escapedSubstring + "\\" + rule.substring(lastEscapedChar + 1, end);

                } else {
                    rawSubstring = rule.substring(start, end);
                }
                sections.push({
                    type : type,
                    raw : rawSubstring
                });
                lastEscapedChar = undefined;
                escapedSubstring = "";
            };

            for (var i = 0; i < rule.length; i++) {

                if (!escaped) {
                    var c = rule.charAt(i);

                    switch(c) {

                    // Enter a deeper bracketed section
                    case '[':
                        if (depth === 0 && !inTag) {
                            if (start < i)
                                createSection(start, i, 0);
                            start = i + 1;
                        }
                        depth++;
                        break;

                    case ']':
                        depth--;

                        // End a bracketed section
                        if (depth === 0 && !inTag) {
                            createSection(start, i, 2);
                            start = i + 1;
                        }
                        break;

                    // Hashtag
                    //   ignore if not at depth 0, that means we are in a bracket
                    case '#':
                        if (depth === 0) {
                            if (inTag) {
                                createSection(start, i, 1);
                                start = i + 1;
                            } else {
                                if (start < i)
                                    createSection(start, i, 0);
                                start = i + 1;
                            }
                            inTag = !inTag;
                        }
                        break;

                    case '\\':
                        escaped = true;
                        escapedSubstring = escapedSubstring + rule.substring(start, i);
                        start = i + 1;
                        lastEscapedChar = i;
                        break;
                    }
                } else {
                    escaped = false;
                }
            }
            if (start < rule.length)
                createSection(start, rule.length, 0);

            if (inTag) {
                errors.push("Unclosed tag");
            }
            if (depth > 0) {
                errors.push("Too many [");
            }
            if (depth < 0) {
                errors.push("Too many ]");
            }

            // Strip out empty plaintext sections

            sections = sections.filter(function(section) {
                if (section.type === 0 && section.raw.length === 0)
                    return false;
                return true;
            });
            sections.errors = errors;
            return sections;
        },
    };

    function isVowel(c) {
        var c2 = c.toLowerCase();
        return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
    };

    function isAlphaNum(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
    };
    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    var baseEngModifiers = {

        replace : function(s, params) {
            //http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
            return s.replace(new RegExp(escapeRegExp(params[0]), 'g'), params[1]);
        },

        capitalizeAll : function(s) {
            var s2 = "";
            var capNext = true;
            for (var i = 0; i < s.length; i++) {

                if (!isAlphaNum(s.charAt(i))) {
                    capNext = true;
                    s2 += s.charAt(i);
                } else {
                    if (!capNext) {
                        s2 += s.charAt(i);
                    } else {
                        s2 += s.charAt(i).toUpperCase();
                        capNext = false;
                    }

                }
            }
            return s2;
        },

        capitalize : function(s) {
            return s.charAt(0).toUpperCase() + s.substring(1);
        },

        a : function(s) {
            if (s.length > 0) {
                if (s.charAt(0).toLowerCase() === 'u') {
                    if (s.length > 2) {
                        if (s.charAt(2).toLowerCase() === 'i')
                            return "a " + s;
                    }
                }

                if (isVowel(s.charAt(0))) {
                    return "an " + s;
                }
            }

            return "a " + s;

        },

        firstS : function(s) {
            console.log(s);
            var s2 = s.split(" ");

            var finished = baseEngModifiers.s(s2[0]) + " " + s2.slice(1).join(" ");
            console.log(finished);
            return finished;
        },

        s : function(s) {
            switch (s.charAt(s.length -1)) {
            case 's':
                return s + "es";
                break;
            case 'h':
                return s + "es";
                break;
            case 'x':
                return s + "es";
                break;
            case 'y':
                if (!isVowel(s.charAt(s.length - 2)))
                    return s.substring(0, s.length - 1) + "ies";
                else
                    return s + "s";
                break;
            default:
                return s + "s";
            }
        },
        ed : function(s) {
            switch (s.charAt(s.length -1)) {
            case 's':
                return s + "ed";
                break;
            case 'e':
                return s + "d";
                break;
            case 'h':
                return s + "ed";
                break;
            case 'x':
                return s + "ed";
                break;
            case 'y':
                if (!isVowel(s.charAt(s.length - 2)))
                    return s.substring(0, s.length - 1) + "ied";
                else
                    return s + "d";
                break;
            default:
                return s + "ed";
            }
        }
    };

    tracery.baseEngModifiers = baseEngModifiers; 
    // Externalize
    tracery.TraceryNode = TraceryNode;

    tracery.Grammar = Grammar;
    tracery.Symbol = Symbol;
    tracery.RuleSet = RuleSet;
    return tracery;
}();

module.exports = tracery; 
},{}],5:[function(require,module,exports){
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
  var decay = .66;
  if (direction == 'black') {
    decay = 1.33;
  }
  for (const k in copy) {
    copy[k] = Math.min(Math.max(copy[k] * decay, 0.0), 1.0);
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

  if (phrase.symbol === 'singularNounPhrase' || phrase.symbol === 'pluralNounPhrase' || phrase.symbol === 'countableNoun' || phrase.symbol === 'describedNoun') {
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

},{"./words.js":7,"ryb2rgb":3}],6:[function(require,module,exports){
module.exports={
  "bright": [
    "adjective",
    "orange",
    "yellow",
    "white"
  ],

  "burning": [
    "adjective",
    "red",
    "orange",
    "yellow"
  ],

  "cold": [
    "adjective",
    "blue",
    "purple",
    "black"
  ],

  "concrete": [
    "adjective",
    "noun",
    "black",
    "uncountable"
  ],

  "consuming": [
    "adjective"
  ],

  "crystal": [
    "adjective",
    "noun",
    "_blue",
    "purple",
    "white",
    "_yellow",
    "countable"
  ],

  "crystalline": [
    "adjective",
    "blue",
    "purple",
    "white",
    "yellow"
  ],

  "dark": [
    "adjective",
    "black",
    "purple"
  ],

  "distant": [
    "adjective"
  ],

  "faint": [
    "adjective"
  ],

  "featureless": [
    "adjective"
  ],

  "fleeting": [
    "adjective"
  ],

  "forgotten": [
    "adjective",
    "relational"
  ],

  "forlorn": [
    "adjective",
    "relational"
  ],

  "glowing": [
    "adjective",
    "white",
    "yellow"
  ],

  "hazy": [
    "adjective",
    "white"
  ],

  "hot": ["_adjective"],

  "imposing": [
    "adjective"
  ],

  "incredible": [
    "adjective"
  ],

  "laughing": [
    "adjective"
  ],

  "lost": [
    "adjective",
    "relational"
  ],

  "marble": [
    "adjective",
    "noun",
    "countable"
  ],

  "masked": [
    "adjective"
  ],

  "melting": [
    "adjective"
  ],

  "old": [
    "adjective",
    "relational"
  ],

  "pale": [
    "adjective",
    "white"
  ],

  "remarkable": [
    "adjective"
  ],

  "restless": [
    "adjective"
  ],

  "second": [
    "adjective"
  ],

  "setting": [
    "adjective"
  ],

  "scorched": [
    "adjective",
    "black",
    "orange"
  ],

  "scorching": ["_adjective"],

  "shapeless": [
    "adjective"
  ],

  "sharp": [
    "adjective"
  ],

  "shattered": [
    "adjective"
  ],

  "shifting": [
    "adjective"
  ],

  "smooth": [
    "adjective"
  ],

  "stonelike": [
    "adjective"
  ],

  "unknown": [
    "adjective"
  ],

  "warm": [
    "adjective",
    "orange"
  ],

  "wavering": [
    "adjective"
  ],

  "apple": [
    "noun",
    "red",
    "green",
    "countable"
  ],

  "bed": [
    "noun",
    "white",
    "blue",
    "countable",
    "colorless"
  ],

  "bird": [
    "noun",
    "black",
    "white",
    "blue",
    "red",
    "yellow",
    "countable",
    "colorless"
  ],

  "building": [
    "noun",
    "countable",
    "black",
    "purple",
    "colorless"
  ],

  "canopy": [
    "noun",
    "countable",
    "green"
  ],

  "car": [
    "noun",
    "red",
    "black",
    "countable",
    "blue",
    "colorless"
  ],

  "carving": [
    "noun",
    "green",
    "black",
    "countable",
    "colorless"
  ],

  "cat": [
    "noun",
    "black",
    "countable",
    "orange",
    "white"
  ],

  "chair": [
    "noun",
    "countable",
    "colorless"
  ],

  "child": [
    "noun",
    "countable",
    "colorless"
  ],

  "city": [
    "noun",
    "countable",
    "black",
    "yellow",
    "colorless"
  ],

  "cloud": [
    "noun",
    "white",
    "countable"
  ],

  "darkness": [
    "noun",
    "uncountable",
    "black"
  ],

  "desk": [
    "noun",
    "countable",
    "colorless"
  ],

  "distance": [
    "_noun",
    "uncountable",
    "colorless"
  ],

  "dog": [
    "noun",
    "colorless",
    "countable"
  ],

  "figure": [
    "noun",
    "countable",
    "colorless"
  ],

  "figurine": [
    "noun",
    "colorless",
    "countable"
  ],

  "fog": [
    "noun",
    "uncountable",
    "white"
  ],

  "forest": [
    "noun",
    "countable",
    "green"
  ],

  "friend": [
    "_noun",
    "relation",
    "colorless",
    "_countable"
  ],

  "ground": [
    "_noun",
    "_colorless",
    "_countable"
  ],

  "haze": [
    "_noun",
    "white",
    "uncountable",
    "blue"
  ],

  "laughter": [
    "noun",
    "uncountable",
    "colorless",
    "yellow"
  ],

  "lemon": [
    "noun",
    "countable",
    "yellow"
  ],

  "love": [
    "_noun",
    "relation",
    "_uncountable",
    "red",
    "nounness"
  ],

  "lightbulb": [
    "noun",
    "countable",
    "yellow",
    "white"
  ],

  "lighthouse": [
    "noun",
    "colorless",
    "red",
    "white",
    "blue",
    "countable",
    "black"
  ],

  "man": [
    "noun",
    "colorless",
    "countable"
  ],

  "moon": [
    "noun",
    "countable",
    "white",
    "black"
  ],

  "moment": [
    "noun",
    "colorless",
    "countable"
  ],

  "mountain": [
    "noun",
    "white",
    "purple",
    "countable",
    "colorless"
  ],

  "mouse": [
    "noun",
    "white",
    "black",
    "colorless",
    "countable"
  ],

  "ocean": [
    "noun",
    "countable",
    "blue"
  ],

  "orange": [
    "noun",
    "orange",
    "countable"
  ],

  "panther": ["_noun"],

  "pen": [
    "noun",
    "blue",
    "black",
    "red",
    "countable"
  ],

  "pendant": [
    "noun",
    "yellow",
    "countable",
    "colorless"
  ],

  "rain": [
    "noun",
    "blue",
    "uncountable"
  ],

  "road": [
    "noun",
    "black",
    "countable",
    "yellow"
  ],

  "rose": [
    "noun",
    "red",
    "countable"
  ],

  "sea": [
    "noun",
    "blue",
    "countable"
  ],

  "secret": [
    "adjective",
    "noun",
    "black",
    "purple",
    "countable"
  ],

  "shade": [
    "noun",
    "purple",
    "black",
    "countable",
    "yellow"
  ],

  "shadow": [
    "noun",
    "countable",
    "black"
  ],

  "shape": [
    "noun",
    "colorless",
    "countable"
  ],

  "snow": [
    "noun",
    "white",
    "uncountable"
  ],

  "solitude": [
    "noun",
    "colorless",
    "uncountable"
  ],

  "spider": [
    "noun",
    "black",
    "countable"
  ],

  "star": [
    "noun",
    "white",
    "yellow",
    "red",
    "blue",
    "countable"
  ],

  "statue": [
    "noun",
    "colorless",
    "countable"
  ],

  "sun": [
    "noun",
    "yellow",
    "white",
    "orange",
    "countable"
  ],

  "sword": [
    "noun",
    "white",
    "colorless",
    "blue",
    "countable"
  ],

  "tide": [
    "noun",
    "countable",
    "blue",
    "white"
  ],

  "thunderhead": [
    "noun",
    "black",
    "purple",
    "countable"
  ],

  "tree": [
    "noun",
    "green",
    "countable"
  ],

  "volcano": [
    "noun",
    "red",
    "orange",
    "countable"
  ],

  "woman": [
    "noun",
    "colorless",
    "countable"
  ],

  "appear": [
    "verb",
    "up"
  ],

  "ascend": [
    "verb",
    "up"
  ],

  "blink": [
    "verb",
    "down"
  ],

  "bloom": [
    "verb",
    "up"
  ],

  "coalesce": [
    "verb",
    "up"
  ],

  "consume": [
    "_verb",
    "up"
  ],

  "crash": [
    "verb",
    "down"
  ],

  "creak": [
    "verb",
    "down"
  ],

  "crumble": [
    "verb",
    "down"
  ],

  "dance": [
    "verb",
    "up"
  ],

  "descend": [
    "verb",
    "down"
  ],

  "disappear": [
    "verb",
    "down"
  ],

  "divide": [
    "_verb"
  ],

  "drift": [
    "verb",
    "down"
  ],

  "envelope": [
    "_verb"
  ],

  "emanate": [
    "verb",
    "up"
  ],

  "fall": [
    "verb",
    "down"
  ],

  "falter": [
    "verb",
    "down"
  ],

  "form": [
    "verb",
    "_up"
  ],

  "float": [
    "verb",
    "up"
  ],

  "fly": [
    "verb",
    "up"
  ],

  "glide": [
    "verb",
    "up"
  ],

  "glow": [
    "verb",
    "up"
  ],

  "grow": [
    "verb",
    "up"
  ],

  "laugh": [
    "verb",
    "_up"
  ],

  "lunge": [
    "_verb"
  ],

  "merge": [
    "verb",
    "_down"
  ],

  "mist": [
    "verb",
    "_down"
  ],

  "move": [
    "verb",
    "_up",
    "_down"
  ],

  "play": [
    "verb",
    "up"
  ],

  "rise": [
    "verb",
    "up"
  ],

  "root": [
    "_verb"
  ],

  "roar": [
    "verb",
    "up"
  ],

  "rumble": [
    "verb",
    "down"
  ],

  "run": [
    "verb",
    "_down"
  ],

  "scatter": [
    "verb",
    "down"
  ],

  "scramble": [
    "verb",
    "_down"
  ],

  "scribble": [
    "_verb"
  ],

  "set": [
    "verb",
    "down"
  ],

  "seep": [
    "verb",
    "down"
  ],

  "shake": [
    "verb",
    "down"
  ],

  "shatter": [
    "verb",
    "down"
  ],

  "shimmer": [
    "verb",
    "up"
  ],

  "shiver": [
    "verb",
    "down"
  ],

  "shrink": [
    "verb",
    "down"
  ],

  "sing": [
    "verb",
    "up"
  ],

  "slide": [
    "verb",
    "down"
  ],

  "smile": [
    "verb",
    "up"
  ],

  "spiral": [
    "verb",
    "down"
  ],

  "stand": [
    "verb",
    "up"
  ],

  "stare": [
    "verb",
    "_down"
  ],

  "swirl": [
    "verb",
    "up"
  ],

  "strive": [
    "_verb",
    "_up"
  ],

  "tower": [
    "verb",
    "up"
  ],

  "trot": [
    "verb",
    "_up"
  ],

  "twinkle": [
    "verb",
    "up"
  ],

  "waft": [
    "verb",
    "down"
  ],

  "walk": [
    "verb",
    "_up"
  ],

  "wave": [
    "verb",
    "_up"
  ],

  "waver": [
    "verb",
    "down"
  ],

  "wink": [
    "verb",
    "down"
  ],

  "butterfly": [
    "noun",
    "yellow",
    "blue",
    "orange",
    "countable"
  ],

  "fairy": [
    "noun",
    "yellow",
    "green",
    "blue",
    "orange",
    "countable"
  ],

  "dragonfly": [
    "noun",
    "blue",
    "countable"
  ],

  "tulip": [
    "noun",
    "white",
    "orange",
    "green",
    "countable"
  ],

  "oak": [
    "noun",
    "green",
    "countable"
  ],

  "autumnal": [
    "adjective",
    "orange"
  ],

  "sand": [
    "noun",
    "uncountable",
    "yellow",
    "white"
  ],

  "night": [
    "noun",
    "uncountable",
    "black",
    "purple"
  ],

  "horse": [
    "noun",
    "countable",
    "black",
    "white"
  ],

  "mossy": [
    "adjective",
    "green"
  ],

  "moss": [
    "noun",
    "uncountable",
    "green"
  ],

  "lichen": [
    "noun",
    "uncountable",
    "green"
  ],

  "envelope": [
    "noun",
    "countable",
    "yellow",
    "white"
  ],

  "magic": [
    "noun",
    "adjective",
    "purple",
    "uncountable"
  ],

  "calm": [
    "adjective",
    "blue"
  ],

  "mysterious": [
    "adjective",
    "black",
    "purple"
  ],

  "elegant": [
    "adjective",
    "black",
    "white"
  ],

  "happy": [
    "yellow",
    "adjective"
  ],

  "vibrant": [
    "adjective",
    "yellow",
    "orange"
  ],

  "dangerous": [
    "adjective",
    "_red"
  ],

  "bleak": [
    "adjective"
  ],

  "active": [
    "_red",
    "_adjective"
  ],

  "plentiful": [
    "adjective",
    "orange"
  ],

  "angel": [
    "noun",
    "countable",
    "white"
  ],

  "demon": [
    "noun",
    "countable",
    "red"
  ],

  "candle": [
    "noun",
    "countable",
    "yellow",
    "white"
  ],

  "ghost": [
    "noun",
    "countable",
    "white"
  ],

  "ghostly": [
    "adjective",
    "white"
  ],

  "crab": [
    "noun",
    "countable",
    "red"
  ],

  "knife": [
    "noun",
    "red",
    "countable"
  ],

  "home": [
    "noun",
    "countable",
    "orange"
  ],

  "rival": [
    "_verb",
    "_noun",
    "relation",
    "countable",
    "red"
  ],

  "transform": [
    "verb"
  ],

  "something": [
    "_uncountable",
    "_noun",
    "_colorless"
  ],

  "sparkle": [
    "verb",
    "up"
  ],

  "pinwheel": [
    "noun",
    "countable",
    "yellow"
  ],

  "chime": [
    "noun",
    "countable",
    "yellow"
  ],

  "flower": [
    "noun",
    "countable",
    "green",
    "white",
    "yellow",
    "red",
    "blue",
    "purple",
    "orange"
  ],

  "fruit": [
    "noun",
    "countable",
    "orange",
    "yellow"
  ],

  "maple": [
    "noun",
    "countable",
    "orange",
    "green"
  ],

  "wind": [
    "noun",
    "countable",
    "blue"
  ],

  "cottage": [
    "noun",
    "countable",
    "green",
    "orange"
  ],

  "chirp": [
    "verb"
  ],

  "curtain": [
    "noun",
    "colorless",
    "countable",
    "red"
  ],

  "speak": [
    "verb"
  ],

  "intone": [
    "verb"
  ],

  "lava": [
    "noun",
    "uncountable",
    "red",
    "orange"
  ],

  "steam": [
    "_verb"
  ],

  "stoplight": [
    "noun",
    "countable",
    "red"
  ],

  "turn": [
    "verb"
  ],

  "ribbon": [
    "red",
    "noun",
    "countable"
  ],

  "flutter": [
    "verb"
  ],

  "giant": [
    "noun",
    "adjective",
    "countable",
    "colorless"
  ],

  "wine": [
    "uncountable",
    "noun",
    "red"
  ],

  "tomato": [
    "countable",
    "noun",
    "red"
  ],

  "bush": [
    "noun",
    "countable",
    "green"
  ],

  "garden": [
    "noun",
    "countable",
    "green"
  ],

  "grass": [
    "noun",
    "uncountable",
    "green"
  ],

  "envious": [
    "adjective",
    "green"
  ],

  "coin": [
    "noun",
    "countable",
    "yellow"
  ],

  "rotten": [
    "adjective",
    "green"
  ],

  "fresh": [
    "adjective",
    "green"
  ],

  "lively": [
    "adjective",
    "green",
    "yellow"
  ],

  "suburb": [
    "noun",
    "countable",
    "colorless"
  ],

  "snake": [
    "noun",
    "countable",
    "green"
  ],

  "lawnmower": [
    "_noun",
    "_countable",
    "_green"
  ],

  "lake": [
    "noun",
    "countable",
    "blue"
  ],

  "sky": [
    "noun",
    "uncountable",
    "blue",
    "orange"
  ],

  "cool": [
    "adjective",
    "blue"
  ],

  "breeze": [
    "noun",
    "blue",
    "uncountable"
  ],

  "crisp": [
    "_adjective",
    "_blue"
  ],

  "sad": [
    "adjective",
    "blue"
  ],

  "crying": [
    "adjective",
    "blue"
  ],

  "cry": [
    "verb",
    "down"
  ],

  "blueberry": [
    "noun",
    "countable",
    "blue"
  ],

  "ink": [
    "noun",
    "uncountable",
    "black"
  ],

  "storm": [
    "noun",
    "verb",
    "uncountable",
    "_blue",
    "black"
  ],

  "rage": [
    "verb",
    "up"
  ],

  "campfire": [
    "noun",
    "countable",
    "orange"
  ],

  "fire": [
    "noun",
    "countable",
    "orange"
  ],

  "golden": [
    "adjective",
    "yellow"
  ],

  "warning": [
    "_noun",
    "_uncountable",
    "_yellow"
  ],

  "citrus": [
    "noun",
    "countable",
    "yellow"
  ],

  "sour": [
    "adjective",
    "yellow"
  ],

  "beach": [
    "noun",
    "countable",
    "yellow",
    "blue"
  ],

  "dune": [
    "noun",
    "countable",
    "yellow"
  ],

  "nightlight": [
    "noun",
    "countable",
    "yellow",
    "black"
  ],

  "wilt": [
    "verb",
    "down"
  ],

  "neon light": [
    "noun",
    "countable",
    "yellow",
    "orange"
  ],

  "cheese": [
    "_noun",
    "_countable",
    "_yellow"
  ],

  "royal": [
    "adjective",
    "purple"
  ],

  "lush": [
    "adjective",
    "green",
    "purple"
  ],

  "grape": [
    "noun",
    "countable",
    "purple"
  ],

  "bruised": [
    "adjective",
    "purple"
  ],

  "plum": [
    "noun",
    "countable",
    "purple"
  ],

  "blacklight": [
    "noun",
    "countable",
    "purple"
  ],

  "coffee": [
    "noun",
    "countable",
    "black"
  ],

  "tar": [
    "noun",
    "uncountable",
    "black"
  ],

  "quiet": [
    "adjective",
    "verb",
    "down",
    "black"
  ],

  "chess piece": [
    "noun",
    "countable",
    "black",
    "white"
  ],

  "sheet": [
    "noun",
    "countable",
    "white"
  ],

  "sheep": [
    "noun",
    "uncountable",
    "white"
  ],

  "avalanche": [
    "noun",
    "white",
    "uncountable"
  ],

  "froth": [
    "verb",
    "up"
  ],

  "smoke": [
    "noun",
    "uncountable",
    "white"
  ],

  "lightning": [
    "noun",
    "uncountable",
    "white"
  ],

  "dandelion": [
    "noun",
    "countable",
    "white",
    "green"
  ],

  "book": [
    "noun",
    "countable",
    "white",
    "green",
    "yellow"
  ],

  "library": [
    "noun",
    "countable",
    "yellow"
  ],

  "tome": [
    "noun",
    "countable",
    "yellow"
  ],

  "field": [
    "noun",
    "countable",
    "yellow",
    "green"
  ],

  "orb": [
    "noun",
    "countable",
    "colorless"
  ],

  "ooze": [
    "noun",
    "countable",
    "green",
    "black"
  ],

  "egg": [
    "noun",
    "countable",
    "white",
    "yellow"
  ],

  "glistening": [
    "adjective"
  ],

  "buzz": [
    "verb"
  ],

  "malachite": [
    "adjective",
    "green"
  ],

  "pine": [
    "noun",
    "countable",
    "green"
  ],

  "jungle": [
    "green",
    "noun",
    "countable"
  ],

  "swamp": [
    "green",
    "noun",
    "countable"
  ],

  "muck": [
    "orange",
    "noun",
    "uncountable"
  ],

  "mud": [
    "orange",
    "noun",
    "uncountable"
  ],

  "root": [
    "noun",
    "countable",
    "green"
  ],

  "summer": [
    "adjective",
    "orange"
  ],

  "rusted": [
    "adjective",
    "orange",
    "red"
  ],

  "copper": [
    "adjective",
    "orange"
  ],

  "midnight": [
    "adjective",
    "black"
  ],

  "shrouded": [
    "adjective",
    "purple",
    "black"
  ],

  "strawberry": [
    "noun",
    "countable",
    "adjective",
    "red"
  ],

  "plush": [
    "adjective",
    "purple"
  ],

  "haunting": [
    "purple",
    "adjective"
  ],

  "hyacinth": [
    "noun",
    "countable",
    "purple"
  ],

  "amethyst": [
    "adjective",
    "noun",
    "countable",
    "purple"
  ],

  "violet": [
    "adjective",
    "noun",
    "countable",
    "purple"
  ],

  "lavender": [
    "adjective",
    "noun",
    "countable",
    "purple"
  ],

  "quartz": [
    "adjective",
    "noun",
    "uncountable",
    "white"
  ],

  "whale": [
    "noun",
    "countable",
    "black",
    "blue"
  ],

  "indombitable": [
    "adjective"
  ],

  "dominating": [
    "adjective"
  ],

  "regal": [
    "adjective",
    "purple"
  ],

  "golden": [
    "adjective",
    "yellow"
  ],

  "bloody": [
    "adjective",
    "red"
  ],

  "flushed": [
    "adjective",
    "red"
  ],

  "smoking": [
    "adjective",
    "white"
  ],

  "cliff": [
    "noun",
    "countable",
    "yellow",
    "white"
  ],

  "sparrow": [
    "noun",
    "colorless",
    "countable"
  ],

  "jay": [
    "noun",
    "countable",
    "blue"
  ],

  "robin": [
    "noun",
    "countable",
    "red"
  ],

  "bat": [
    "noun",
    "countable",
    "black"
  ],

  "sycamore": [
    "noun",
    "countable",
    "green"
  ],

  "bicycle": [
    "noun",
    "countable",
    "colorless"
  ],

  "log": [
    "noun",
    "countable",
    "green"
  ],

  "climb": [
    "verb",
    "up"
  ],

  "meteor": [
    "noun",
    "countable",
    "black",
    "orange"
  ],

  "planet": [
    "noun",
    "countable",
    "colorless"
  ],

  "kudzu": [
    "noun",
    "countable",
    "green"
  ],

  "fish": [
    "noun",
    "countable",
    "blue",
    "yellow",
    "purple"
  ],

  "gull": [
    "noun",
    "countable",
    "white"
  ],

  "albatross": [
    "noun",
    "countable",
    "white",
    "blue"
  ],

  "shoe": [
    "noun",
    "countable",
    "colorless"
  ],

  "rock": [
    "noun",
    "countable",
    "orange",
    "black"
  ],

  "boulder": [
    "noun",
    "countable",
    "orange",
    "black"
  ],

  "stone": [
    "noun",
    "adjective",
    "countable",
    "orange",
    "black"
  ],

  "fence": [
    "noun",
    "countable",
    "white"
  ],

  "rolling": [
    "adjective"
  ],

  "roll": [
    "verb"
  ],

  "hill": [
    "noun",
    "countable",
    "orange",
    "green",
    "yellow"
  ],

  "march": [
    "verb"
  ],

  "bubble": [
    "verb",
    "noun",
    "countable",
    "blue",
    "white"
  ],

  "boat": [
    "noun",
    "countable",
    "blue"
  ],

  "ship": [
    "noun",
    "countable",
    "black",
    "blue"
  ],

  "sail": [
    "verb",
    "up"
  ],

  "crest": [
    "verb"
  ],

  "ash": [
    "noun",
    "countable",
    "white"
  ],

  "observatory": [
    "noun",
    "countable",
    "colorless"
  ],

  "bridge": [
    "noun",
    "countable",
    "colorless"
  ],

  "shuttle": [
    "noun",
    "verb",
    "countable",
    "colorless"
  ],

  "squat": [
    "verb",
    "adjective"
  ],

  "striated": [
    "adjective"
  ],

  "camera": [
    "noun",
    "countable",
    "black"
  ],

  "clicking": [
    "adjective"
  ],

  "buzzing": [
    "adjective"
  ],

  "buzz": [
    "verb"
  ],

  "click": [
    "verb"
  ],

  "cannon": [
    "noun",
    "countable",
    "black"
  ],

  "thunder": [
    "verb",
    "up"
  ],

  "round": [
    "adjective"
  ],

  "weathered": [
    "adjective"
  ],

  "tunnel": [
    "noun",
    "countable",
    "_verb",
    "black"
  ],

  "dinosaur": [
    "noun",
    "countable",
    "green",
    "black"
  ],

  "reptile": [
    "noun",
    "countable",
    "green",
    "black"
  ],

  "lizard": [
    "noun",
    "countable",
    "green",
    "black"
  ],

  "plumed": [
    "adjective"
  ],

  "bronze": [
    "adjective",
    "yellow"
  ],

  "brass": [
    "adjective",
    "yellow"
  ],

  "monkey": [
    "noun",
    "countable",
    "green"
  ],

  "long": [
    "adjective"
  ],

  "wide": [
    "adjective"
  ],

  "writhing": [
    "adjective"
  ],

  "writhe": [
    "verb",
    "down"
  ],

  "wiggle": [
    "verb"
  ],

  "water": [
    "noun",
    "countable",
    "blue"
  ],

  "pour": [
    "verb"
  ],

  "pike": [
    "noun",
    "countable",
    "colorless"
  ],

  "hike": [
    "verb"
  ],

  "folded": [
    "adjective"
  ],

  "fold": [
    "verb"
  ],

  "bone": [
    "noun",
    "countable",
    "white"
  ],

  "skyscraper": [
    "noun",
    "countable",
    "blue"
  ],

  "valley": [
    "noun",
    "countable",
    "green",
    "yellow"
  ],

  "chipmunk": [
    "noun",
    "countable",
    "green",
    "orange"
  ],

  "squirrel": [
    "noun",
    "countable",
    "green"
  ],

  "baleful": [
    "adjective"
  ],

  "shark": [
    "noun",
    "countable",
    "blue"
  ],

  "corn": [
    "noun",
    "countable",
    "yellow"
  ],

  "cornflower": [
    "blue",
    "purple",
    "adjective",
    "noun",
    "countable"
  ],

  "goldenrod": [
    "adjective",
    "yellow"
  ],

  "gossamer": [
    "adjective"
  ],

  "bluff": [
    "noun",
    "countable",
    "white",
    "yellow"
  ],

  "outcrop": [
    "_noun",
    "_countable",
    "_colorless"
  ],

  "red-dressed": [
    "adjective",
    "red"
  ],

  "black-clad": [
    "adjective",
    "black"
  ],

  "beetle": [
    "noun",
    "countable",
    "blue",
    "black"
  ],

  "scarab": [
    "noun",
    "countable",
    "blue",
    "black"
  ],

  "leaf": [
    "noun",
    "countable",
    "green",
    "orange",
    "yellow",
    "red"
  ],

  "kitten": [
    "noun",
    "countable",
    "orange",
    "black",
    "yellow"
  ],

  "puppy": [
    "noun",
    "countable",
    "orange",
    "black",
    "yellow"
  ],

  "abandoned": [
    "adjective"
  ],

  "constellation": [
    "noun",
    "countable",
    "blue",
    "black"
  ],

  "card": [
    "noun",
    "countable",
    "colorless"
  ],

  "flip": [
    "verb"
  ],

  "stout": [
    "adjective"
  ],

  "brood": [
    "verb",
    "down"
  ],

  "seafoam": [
    "noun",
    "white",
    "uncountable"
  ],

  "cinnabar": [
    "adjective",
    "_noun",
    "red"
  ],

  "sulfurous": [
    "adjective"
  ],

  "shamble": [
    "verb",
    "down"
  ],

  "caw": [
    "verb"
  ],

  "reach": [
    "verb"
  ],

  "thorned": [
    "adjective"
  ],

  "spined": [
    "adjective"
  ],

  "gallivant": [
    "verb",
    "up"
  ],

  "cut": [
    "verb"
  ],

  "schooner": [
    "noun",
    "countable",
    "blue"
  ],

  "empty": [
    "adjective"
  ],

  "copse": [
    "noun",
    "countable",
    "green"
  ],

  "clearing": [
    "noun",
    "countable",
    "green"
  ],

  "lot": [
    "noun",
    "countable",
    "black"
  ],

  "structure": [
    "noun",
    "countable",
    "colorless"
  ],

  "miasma": [
    "noun",
    "uncountable",
    "colorless",
    "purple"
  ],

  "storefront": [
    "noun",
    "countable",
    "yellow",
    "white",
    "black"
  ],

  "shop": [
    "noun",
    "countable",
    "yellow",
    "white",
    "black"
  ],

  "chicken": [
    "countable",
    "noun",
    "white"
  ],

  "device": [
    "noun",
    "countable",
    "colorless"
  ],

  "alien": [
    "adjective"
  ],

  "geometric": [
    "adjective"
  ],

  "ephemeral": [
    "adjective"
  ],

  "unknown": [
    "adjective"
  ],

  "writing": [
    "noun",
    "countable",
    "colorless"
  ],

  "spindly": [
    "adjective"
  ],

  "heart": [
    "noun",
    "countable",
    "red"
  ],

  "beating": [
    "adjective"
  ],

  "cup": [
    "noun",
    "countable",
    "colorless"
  ],

  "pentacle": [
    "noun",
    "countable",
    "colorless"
  ],

  "wand": [
    "noun",
    "countable",
    "colorless"
  ],

  "spear": [
    "noun",
    "countable",
    "colorless"
  ],

  "diamond": [
    "adjective",
    "noun",
    "white"
  ],

  "overflow": [
    "verb",
    "up"
  ],

  "pyramid": [
    "noun",
    "countable",
    "yellow"
  ],

  "well": [
    "noun",
    "countable",
    "black"
  ],

  "bay": [
    "noun",
    "countable",
    "blue"
  ],

  "cove": [
    "noun",
    "countable",
    "blue"
  ],

  "desert": [
    "noun",
    "countable",
    "yellow"
  ],

  "flatland": [
    "noun",
    "countable",
    "colorless"
  ],

  "plain": [
    "noun",
    "countable",
    "yellow",
    "green"
  ],

  "savannah": [
    "noun",
    "countable",
    "yellow"
  ],

  "rowboat": [
    "noun",
    "countable",
    "blue"
  ],

  "canoe": [
    "noun",
    "countable",
    "blue"
  ],

  "catamaran": [
    "noun",
    "countable",
    "blue"
  ],

  "streetlight": [
    "noun",
    "countable",
    "orange",
    "yellow",
    "black"
  ],

  "person": [
    "noun",
    "countable",
    "colorless"
  ],

  "crowd": [
    "noun",
    "countable",
    "colorless"
  ],

  "crowded": [
    "adjective"
  ],

  "stair": [
    "noun",
    "colorless",
    "countable"
  ],

  "robot": [
    "noun",
    "countable",
    "white",
    "blue"
  ],

  "condor": [
    "noun",
    "countable",
    "black"
  ],

  "rattlesnake": [
    "noun",
    "countable",
    "green",
    "black"
  ],

  "maraca": [
    "countable",
    "noun",
    "orange"
  ],

  "reminisce": [
    "verb"
  ],

  "wagon": [
    "countable",
    "noun",
    "white"
  ],

  "monument": [
    "countable",
    "noun",
    "colorless",
    "black"
  ],

  "monumental": [
    "adjective"
  ],

  "massive": [
    "adjective"
  ],

  "miniscule": [
    "adjective"
  ],

  "invisible": [
    "adjective"
  ],

  "ornery": [
    "adjective"
  ],

  "mourning": [
    "adjective",
    "black",
    "blue"
  ],

  "furious": [
    "adjective",
    "red"
  ],

  "broken": [
    "adjective"
  ],

  "break": [
    "verb",
    "down"
  ],

  "branch": [
    "noun",
    "countable",
    "green",
    "verb"
  ],

  "wild": [
    "adjective"
  ],

  "balloon": [
    "noun",
    "countable",
    "red"
  ],

  "poppy": [
    "noun",
    "countable",
    "red",
    "orange"
  ],

  "bench": [
    "noun",
    "countable",
    "colorless"
  ],

  "stump": [
    "noun",
    "countable",
    "green"
  ],

  "mushroom": [
    "noun",
    "countable",
    "white",
    "red",
    "black"
  ],

  "clatter": [
    "verb"
  ],

  "bead": [
    "noun",
    "countable",
    "colorless"
  ],

  "drop": [
    "verb",
    "down"
  ],

  "drip": [
    "verb"
  ],

  "about": [
    "preposition"
  ],

  "above": [
    "preposition"
  ],

  "across": [
    "preposition"
  ],

  "after": [
    "preposition"
  ],

  "against": [
    "preposition"
  ],

  "among": [
    "preposition"
  ],

  "around": [
    "preposition"
  ],

  "at": [
    "_preposition"
  ],

  "before": [
    "preposition"
  ],

  "behind": [
    "preposition"
  ],

  "below": [
    "preposition"
  ],

  "beside": [
    "preposition"
  ],

  "between": [
    "_preposition"
  ],

  "by": [
    "preposition"
  ],

  "down": [
    "_preposition"
  ],

  "during": [
    "_preposition"
  ],

  "for": [
    "_preposition"
  ],

  "from": [
    "preposition"
  ],

  "in": [
    "preposition"
  ],

  "inside": [
    "preposition"
  ],

  "into": [
    "preposition"
  ],

  "near": [
    "preposition"
  ],

  "off": [
    "preposition"
  ],

  "on": [
    "preposition"
  ],

  "out of": [
    "preposition"
  ],

  "over": [
    "preposition"
  ],

  "through": [
    "preposition"
  ],

  "to": [
    "_preposition"
  ],

  "toward": [
    "preposition"
  ],

  "under": [
    "preposition"
  ],

  "up": [
    "_preposition"
  ],

  "with": [
    "_preposition"
  ],

  "coldness": [
    "nounness"
  ],

  "sweetness": [
    "nounness"
  ],

  "fickleness": [
    "nounness"
  ],

  "serenity": [
    "nounness"
  ],

  "quietness": [
    "nounness"
  ],

  "warmth": [
    "nounness"
  ],

  "heat": [
    "nounness"
  ],

  "brightness": [
    "nounness"
  ],

  "darkness": [
    "nounness"
  ],

  "quiet": [
    "nounness"
  ],

  "rage": [
    "nounness"
  ],

  "passion": [
    "nounness"
  ],

  "sadness": [
    "nounness"
  ],

  "wisdom": [
    "nounness"
  ],

  "folly": [
    "nounness"
  ],

  "soft": [
    "adjective"
  ],

  "glassy": [
    "adjective"
  ],

  "glass": [
    "adjective",
    "blue"
  ],

  "window": [
    "noun",
    "countable",
    "colorless"
  ],

  "furtive": [
    "adjective"
  ],

  "lantern": [
    "noun",
    "countable",
    "yellow",
    "black"
  ],

  "lamp": [
    "noun",
    "countable",
    "yellow",
    "black"
  ],

  "yield": [
    "verb",
    "down"
  ],

  "torch": [
    "noun",
    "countable",
    "orange"
  ],

  "wrought-iron": [
    "adjective",
    "black"
  ],

  "cage": [
    "noun",
    "countable",
    "colorless"
  ],

  "gilded": [
    "adjective",
    "yellow"
  ],

  "engraved": [
    "adjective"
  ],

  "cherished": [
    "relational"
  ],

  "tired": [
    "adjective"
  ],

  "ancient": [
    "adjective"
  ],

  "clock": [
    "noun",
    "countable",
    "colorless"
  ],

  "thrum": [
    "verb",
    "up"
  ],

  "hum": [
    "verb",
    "up"
  ],

  "hummingbird": [
    "noun",
    "countable",
    "green"
  ],

  "paved": [
    "adjective",
    "black"
  ]

}

},{}],7:[function(require,module,exports){
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
  if (s.length >= 4 && s.slice(-4) === 'leaf') {
    return s.slice(0, -4) + 'leaves';
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

},{"./words.json":6,"tracery-grammar":4}]},{},[1])(1)
});
