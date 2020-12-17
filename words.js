const data = require('./words.json');

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
    var has = tags.reduce((total, tag) => {
      return total && desc.includes(tag);
    });
    if (has) {
      words.push(word);
    }
  }
  return words;
}

//stats(tagTree);
//console.log(taggedBy('noun', 'uncountable'));

module.exports = {
  'tagTree': tagTree,
  'data': data,
  'hasTag': hasTag,
  'taggedBy': taggedBy
};
