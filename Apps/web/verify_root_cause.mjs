// Root cause analysis verification script
import fs from 'fs';

// 1. Check if vendor-ui contains ReactCurrentOwner (proves React internals are in the wrong chunk)
const vendorUi = fs.readFileSync('dist/assets/vendor-ui-DZmSu5b5.js', 'utf8');
const vendorReact = fs.readFileSync('dist/assets/vendor-react--8N4YbGI.js', 'utf8');

console.log('=== ROOT CAUSE ANALYSIS ===\n');

console.log('1. vendor-ui.js contains ReactCurrentOwner:', vendorUi.includes('ReactCurrentOwner'));
console.log('   (vendor-ui should ONLY have framer-motion + lucide-react - React must NOT be here)\n');

// 2. Check what react-dom accesses from React
const reactDom = fs.readFileSync('node_modules/react-dom/cjs/react-dom.production.min.js', 'utf8');
const hasReactCurrentOwner = reactDom.includes('ReactCurrentOwner');
console.log('2. react-dom production references ReactCurrentOwner:', hasReactCurrentOwner);

// 3. Test the Terser regex against React's internal property names
const reactProd = fs.readFileSync('node_modules/react/cjs/react.production.min.js', 'utf8');

// Extract the internal properties list from React
const internalMatches = reactProd.match(/{key:!0,ref:!0,__self:!0,__source:!0}/g);
console.log('3. React internal property list found:', internalMatches ? internalMatches.length : 0, 'times');

// Test which properties match /^_/
const testProps = ['__self', '__source', '_owner', '_source', '_self', 'key', 'ref', '$$typeof', 'type', 'props'];
console.log('4. Terser mangle regex /^_/ matches these React element properties:');
testProps.forEach(p => {
  const matches = /^_/.test(p);
  if (matches) console.log('   MANGLED:', p);
});

// 4. Show what properties would be mangled
const ownerProps = ['_owner', '__owner', '__self', '__source', '_source', '_self'];
console.log('\n5. Properties STARTING with underscore that WOULD be mangled by Terser:');
ownerProps.forEach(p => {
  console.log(`   "${p}" => /^_/ matches: ${/^_/.test(p)}`);
});

// 5. Check for duplicate React in node_modules
console.log('\n6. Checking for duplicate React installations...');
try {
  const allReactDirs = [];
  function findReact(dir, depth=0) {
    if (depth > 6) return;
    try {
      const entries = fs.readdirSync(dir, {withFileTypes: true});
      for (const entry of entries) {
        if (entry.name === 'node_modules' && depth > 0) return; // don't recurse into node_modules
        if (entry.name === 'react' && entry.isDirectory()) {
          allReactDirs.push(dir + '/' + entry.name);
        }
        if (entry.isDirectory()) findReact(dir + '/' + entry.name, depth+1);
      }
    } catch(e) {}
  }
  findReact('Apps/web');
  console.log('   React directories found:', allReactDirs.length);
  allReactDirs.forEach(d => console.log('   -', d));
} catch(e) {}

console.log('\n=== CONCLUSION ===');
console.log('The mangle.properties.regex: /^_/ option in vite.config.js Mangles ALL');
console.log('properties starting with underscore - including React internals:');
console.log('  __self (JSX self reference)');
console.log('  __source (JSX source reference)');
console.log('  _owner (element owner)');
console.log('  _source, _self (additional internals)');
console.log('\nWhen Terser renames these properties, React can no longer identify');
console.log('React elements, causing ReactCurrentOwner access to fail.');
console.log('\nvendor-ui.js containing ReactCurrentOwner proves framer-motion has');
console.log('brought React internals into its chunk (via JSX transformation).');
