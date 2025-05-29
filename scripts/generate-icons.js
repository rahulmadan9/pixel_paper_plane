const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icon generation function
function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient (sky)
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#92E2FF');
  gradient.addColorStop(1, '#EAF9FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw paper plane
  const scale = size / 200; // Scale factor based on 200px base
  const centerX = size / 2;
  const centerY = size / 2;
  
  ctx.fillStyle = '#377DFF';
  ctx.beginPath();
  ctx.moveTo(centerX + 30 * scale, centerY);
  ctx.lineTo(centerX - 15 * scale, centerY + 18 * scale);
  ctx.lineTo(centerX - 7 * scale, centerY + 4 * scale);
  ctx.lineTo(centerX - 7 * scale, centerY - 4 * scale);
  ctx.lineTo(centerX - 15 * scale, centerY - 18 * scale);
  ctx.lineTo(centerX + 30 * scale, centerY);
  ctx.closePath();
  ctx.fill();
  
  // Add white detail line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX + 30 * scale, centerY);
  ctx.lineTo(centerX - 12 * scale, centerY);
  ctx.stroke();
  
  // Round corners for better icon appearance
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Check if canvas module exists, if not provide alternative
try {
  // Generate icons
  generateIcon(192, 'icon-192x192.png');
  generateIcon(512, 'icon-512x512.png');
  
  console.log('✅ PWA icons generated successfully!');
} catch (error) {
  console.log('❌ Canvas module not available. Creating simple placeholder icons...');
  
  // Create simple placeholder files
  const placeholder192 = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x00, 0xC0
  ]);
  
  fs.writeFileSync('public/icon-192x192.png', placeholder192);
  fs.writeFileSync('public/icon-512x512.png', placeholder192);
  
  console.log('✅ Placeholder icons created. Replace with actual icons later.');
} 