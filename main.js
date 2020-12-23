const words = require('./words.js');
const spectrum = require('./spectrum.js');
const dreamer = require('./dreamer.js');
const readline = require('readline');
const fs = require('fs');
/*
const ryb2rgb = require('ryb2rgb');
console.log(ryb2rgb([255,0,0]));
console.log(ryb2rgb([0,255,255]));
console.log(ryb2rgb([0,0,0]));
console.log(ryb2rgb([0,0,0]));

var grammarJson = {...words.baseGrammar}
grammarJson['verbing'] = grammarJson['verb'].map(words.mods.ing)
var grammarStr = JSON.stringify(grammarJson);
grammarStr = grammarStr.replace('verb.ing', 'verbing');
fs.writeFile('./grammar.json', grammarStr, 'utf8', (err) => {
  if (err) {
    console.log(`Error writing file: ${err}`);
  }
});
*/

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
var sleeper = new dreamer.Dreamer(words.baseGrammar, words.mods);

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
