#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Path to the cloned LoveToType repository
const baseDir = path.resolve(__dirname, '../lovetotype');
if (!fs.existsSync(baseDir)) {
  console.error('Error: LoveToType directory not found at', baseDir);
  process.exit(1);
}

// Regex to match data files
const dataPattern = /^data_([1-4][abr])\.lua$/;
const files = fs.readdirSync(baseDir).filter((f) => dataPattern.test(f));

// Initialize sets for each difficulty
const wordGroups = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
};

files.forEach((file) => {
  const match = file.match(dataPattern);
  const level = match[1]; // e.g., '1a', '2r'
  const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');
  // Extract all lowercase alphabetic string literals
  const matches = [...content.matchAll(/['\"]([a-z]+)['\"]/g)].map((m) => m[1]);
  // Determine difficulty category
  let category;
  if (level.startsWith('1') || level.startsWith('2')) category = 'easy';
  else if (level.startsWith('3')) category = 'medium';
  else category = 'hard';
  // Add words to the set
  matches.forEach((word) => wordGroups[category].add(word));
});

// Write out JSON files
Object.entries(wordGroups).forEach(([category, wordSet]) => {
  const words = Array.from(wordSet).sort();
  const outPath = path.resolve(__dirname, `../src/data/${category}.json`);
  fs.writeFileSync(outPath, JSON.stringify(words, null, 2));
  console.log(`Wrote ${words.length} ${category} words to ${outPath}`);
});