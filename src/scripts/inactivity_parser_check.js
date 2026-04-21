const fs = require('fs');
const parser = require('@typescript-eslint/parser');
const text = fs.readFileSync('src/utils/inactivityHandler.js', 'utf8');
try {
  parser.parse(text, { sourceType: 'module', ecmaVersion: 2020 });
  console.log('parsed ok');
} catch (e) {
  console.error('ERROR', e.message);
  if (e.lineNumber && e.column) console.error('line', e.lineNumber, 'col', e.column);
  console.error(e);
}
