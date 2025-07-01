import fs from 'fs';
import path from 'path';

const requiredAssets = [
  'public/assets/sprites/plane_right.png',
  'public/assets/sprites/ring_gold.png',
  'public/assets/sprites/ring_silver.png',
  'public/assets/sprites/ring_bronze.png',
  'public/assets/sprites/tree1.png',
  'public/assets/sprites/tree2.png',
  'public/assets/sprites/bush.png'
];

console.log('🔍 Checking for required assets...\n');

let allFound = true;

requiredAssets.forEach(assetPath => {
  const exists = fs.existsSync(assetPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${assetPath}`);
  if (!exists) allFound = false;
});

console.log('\n' + '='.repeat(50));

if (allFound) {
  console.log('🎉 All assets found! The game should work correctly.');
} else {
  console.log('⚠️  Missing assets detected!');
  console.log('\nTo fix the black boxes issue:');
  console.log('1. Create the directory: public/assets/sprites/');
  console.log('2. Place your 7 PNG files with exact names:');
  console.log('   - plane_right.png (64x64 plane sprite)');
  console.log('   - ring_gold.png (64x64 gold ring)');
  console.log('   - ring_silver.png (64x64 silver ring)');
  console.log('   - ring_bronze.png (64x64 bronze ring)');
  console.log('   - tree1.png (425x663 tree sprite)');
  console.log('   - tree2.png (490x625 tree sprite)');
  console.log('   - bush.png (342x217 bush sprite)');
  console.log('3. Restart your dev server: npm run dev');
  console.log('\nUntil then, the game will use fallback graphics.');
}

console.log('\n🚀 Run this script anytime: node check-assets.js'); 