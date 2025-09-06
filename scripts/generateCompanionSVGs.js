/**
 * Generate companion SVG images as placeholders
 * These can be replaced with DALL-E generated images later
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const companions = [
  {
    id: 'finn',
    name: 'Finn',
    emoji: '🦸',
    color: '#8B5CF6',
    bgColor: '#8B5CF620'
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '🦉',
    color: '#10B981',
    bgColor: '#10B98120'
  },
  {
    id: 'spark',
    name: 'Spark',
    emoji: '⚡',
    color: '#F59E0B',
    bgColor: '#F59E0B20'
  },
  {
    id: 'harmony',
    name: 'Harmony',
    emoji: '🌸',
    color: '#EC4899',
    bgColor: '#EC489920'
  }
];

// Create output directory
const outputDir = path.join(__dirname, '..', 'public', 'images', 'companions');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

// Generate SVG for each companion
companions.forEach(companion => {
  const svg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="128" cy="128" r="110" fill="${companion.bgColor}" stroke="${companion.color}" stroke-width="3"/>
  
  <!-- Inner glow -->
  <circle cx="128" cy="128" r="95" fill="${companion.bgColor}" opacity="0.5"/>
  
  <!-- Character emoji -->
  <text x="128" y="140" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="${companion.color}">
    ${companion.emoji}
  </text>
  
  <!-- Character name -->
  <text x="128" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="${companion.color}">
    ${companion.name}
  </text>
  
  <!-- Decorative elements -->
  ${companion.id === 'finn' ? `
    <!-- Cape effect -->
    <path d="M 88 140 Q 88 180 78 200 L 98 190 L 118 200 Q 108 180 108 140" fill="${companion.color}" opacity="0.3"/>
    <path d="M 148 140 Q 148 180 158 200 L 178 190 L 198 200 Q 188 180 188 140" fill="${companion.color}" opacity="0.3"/>
  ` : ''}
  
  ${companion.id === 'spark' ? `
    <!-- Lightning bolts -->
    <path d="M 60 60 L 70 80 L 55 80 L 65 100" stroke="${companion.color}" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M 196 60 L 186 80 L 201 80 L 191 100" stroke="${companion.color}" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M 60 156 L 70 176 L 55 176 L 65 196" stroke="${companion.color}" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M 196 156 L 186 176 L 201 176 L 191 196" stroke="${companion.color}" stroke-width="2" fill="none" opacity="0.5"/>
  ` : ''}
  
  ${companion.id === 'harmony' ? `
    <!-- Flower petals -->
    <circle cx="88" cy="88" r="8" fill="${companion.color}" opacity="0.3"/>
    <circle cx="168" cy="88" r="8" fill="${companion.color}" opacity="0.3"/>
    <circle cx="88" cy="168" r="8" fill="${companion.color}" opacity="0.3"/>
    <circle cx="168" cy="168" r="8" fill="${companion.color}" opacity="0.3"/>
  ` : ''}
  
  ${companion.id === 'sage' ? `
    <!-- Graduation cap -->
    <rect x="108" y="55" width="40" height="5" fill="${companion.color}"/>
    <polygon points="128,50 118,55 138,55" fill="${companion.color}"/>
    <line x1="128" y1="50" x2="135" y2="45" stroke="${companion.color}" stroke-width="2"/>
    <circle cx="135" cy="45" r="3" fill="${companion.color}"/>
  ` : ''}
</svg>`;

  const filepath = path.join(outputDir, `${companion.id}.svg`);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Created ${companion.name} at ${filepath}`);
});

console.log('\n🎉 All companion SVG images created successfully!');
console.log(`📁 Images saved to: ${outputDir}`);
console.log('\n💡 These SVG placeholders can be replaced with DALL-E generated PNGs later.');