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
