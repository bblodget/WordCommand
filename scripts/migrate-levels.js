#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Directory for existing word lists
const dataDir = path.resolve(__dirname, '../src/data');
const easy = JSON.parse(fs.readFileSync(path.join(dataDir, 'easy.json'), 'utf-8'));
const medium = JSON.parse(fs.readFileSync(path.join(dataDir, 'medium.json'), 'utf-8'));
const hard = JSON.parse(fs.readFileSync(path.join(dataDir, 'hard.json'), 'utf-8'));

// Helper to dedupe
const uniq = arr => Array.from(new Set(arr));

// Define level filters
const level1 = uniq(easy.filter(w => w.length >= 3 && w.length <= 4));
const level2 = uniq([...easy, ...medium].filter(w => w.length >= 4 && w.length <= 5));
const level3 = uniq([...medium, ...hard].filter(w => w.length >= 5 && w.length <= 7));
const level4 = uniq([...medium, ...hard].filter(w => w.length >= 8));
const hardPatterns = ['th', 'qu', 'gh', 'ph', 'rh'];
const level5 = uniq(
  [...medium, ...hard].filter(w => hardPatterns.some(p => w.includes(p)))
);

// Write out leveled JSON
const write = (name, arr) => {
  const file = path.join(dataDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(arr.sort(), null, 2));
  console.log(`Wrote ${arr.length} words to ${name}.json`);
};

write('level1', level1);
write('level2', level2);
write('level3', level3);
write('level4', level4);
write('level5', level5);