/**
 * Script to generate companion character images using DALL-E
 * Run this once to create all companion avatars
 * Usage: node scripts/generateCompanionImages.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { azureKeyVaultConfig } from '../src/services/azureKeyVaultConfig.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const companions = [
  {
    id: 'finn',
    name: 'Finn',
    prompt: `
      Create a friendly cartoon character avatar for a children's education app.
      Character: A purple robot superhero with a cape and mask.
      - Metallic purple body with rounded, friendly features
      - LED-style eyes that look happy and enthusiastic
      - Purple cape flowing behind
      - Small superhero mask around the eyes
      - Big friendly smile
      - Arms in a helpful, welcoming pose
      Style: Pixar-like 3D cartoon, vibrant colors, white background
      Color scheme: Various shades of purple (#8B5CF6 as primary)
      Format: Square, centered, suitable for avatar use
      No text or letters in the image.
    `
  },
  {
    id: 'sage',
    name: 'Sage',
    prompt: `
      Create a friendly cartoon character avatar for a children's education app.
      Character: A wise owl professor with glasses and graduation cap.
      - Forest green feathers with lighter green accents
      - Round, scholarly glasses
      - Black graduation cap with tassel
      - Holding an open book with wings
      - Warm, intelligent expression
      - Standing on a small branch
      Style: Pixar-like 3D cartoon, vibrant colors, white background
      Color scheme: Various shades of green (#10B981 as primary)
      Format: Square, centered, suitable for avatar use
      No text or letters in the image.
    `
  },
  {
    id: 'spark',
    name: 'Spark',
    prompt: `
      Create a friendly cartoon character avatar for a children's education app.
      Character: An energetic lightning bolt character with personality.
      - Yellow-orange lightning bolt shape as the body
      - Cartoon arms and legs extending from the bolt
      - Big excited eyes and huge grin
      - Electric sparkles and energy effects around it
      - Dynamic, energetic pose like jumping or dancing
      - Glowing aura effect
      Style: Pixar-like 3D cartoon, vibrant colors, white background
      Color scheme: Bright orange and yellow (#F59E0B as primary)
      Format: Square, centered, suitable for avatar use
      No text or letters in the image.
    `
  },
  {
    id: 'harmony',
    name: 'Harmony',
    prompt: `
      Create a friendly cartoon character avatar for a children's education app.
      Character: A gentle flower fairy with butterfly wings.
      - Pink flower petals forming a dress
      - Delicate butterfly wings in pink and white
      - Flower crown on head
      - Holding a small magic wand with a heart at the tip
      - Peaceful, kind expression with gentle smile
      - Soft, calming presence
      Style: Pixar-like 3D cartoon, vibrant colors, white background
      Color scheme: Soft pink and rose colors (#EC4899 as primary)
      Format: Square, centered, suitable for avatar use
      No text or letters in the image.
    `
  }
];

// Initialize OpenAI client with Azure Key Vault
let openai = null;

async function initializeOpenAI() {
  try {
    // Get configuration from Azure Key Vault
    const config = await azureKeyVaultConfig.getOpenAIConfig();
    
    openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}/openai/deployments/dall-e-3`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 
        'api-key': config.apiKey 
      }
    });
    
    console.log('✅ OpenAI client initialized with Azure Key Vault configuration');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI from Key Vault:', error.message);
    
    // Fallback to environment variables if Key Vault fails
    const apiKey = process.env.VITE_AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
    if (apiKey) {
      openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://pathfinity-ai.openai.azure.com/openai/deployments/dall-e-3',
        defaultQuery: { 'api-version': '2024-02-01' },
        defaultHeaders: { 'api-key': apiKey }
      });
      console.log('✅ OpenAI client initialized with environment variables');
      return true;
    }
    
    return false;
  }
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'images', 'companions');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

/**
 * Download image from URL and save as PNG
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Generate a single companion image
 */
async function generateCompanionImage(companion) {
  console.log(`\n🎨 Generating ${companion.name}...`);
  
  const outputPath = path.join(outputDir, `${companion.id}.png`);
  
  // Check if image already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✅ ${companion.name} already exists at ${outputPath}`);
    return;
  }
  
  try {
    // Generate image with DALL-E
    console.log('📡 Calling DALL-E API...');
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: companion.prompt.trim(),
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });
    
    if (!response.data || !response.data[0]?.url) {
      throw new Error('No image URL in response');
    }
    
    const imageUrl = response.data[0].url;
    console.log('✅ Image generated successfully');
    
    // Download and save the image
    console.log(`💾 Saving to ${outputPath}...`);
    await downloadImage(imageUrl, outputPath);
    console.log(`✅ ${companion.name} saved successfully!`);
    
    // Also save a smaller version (256x256) if needed
    // This would require additional image processing library like sharp
    
  } catch (error) {
    console.error(`❌ Failed to generate ${companion.name}:`, error.message);
    
    // Create a fallback SVG if DALL-E fails
    console.log('📐 Creating fallback SVG...');
    createFallbackSVG(companion, outputPath.replace('.png', '.svg'));
  }
}

/**
 * Create a fallback SVG if image generation fails
 */
function createFallbackSVG(companion, filepath) {
  const colors = {
    finn: '#8B5CF6',
    sage: '#10B981',
    spark: '#F59E0B',
    harmony: '#EC4899'
  };
  
  const emojis = {
    finn: '🦸',
    sage: '🦉',
    spark: '⚡',
    harmony: '🌸'
  };
  
  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="white"/>
      <circle cx="128" cy="128" r="100" fill="${colors[companion.id]}20"/>
      <text x="128" y="140" font-size="80" text-anchor="middle" fill="${colors[companion.id]}">
        ${emojis[companion.id]}
      </text>
      <text x="128" y="200" font-size="24" text-anchor="middle" fill="${colors[companion.id]}" font-weight="bold">
        ${companion.name}
      </text>
    </svg>
  `;
  
  fs.writeFileSync(filepath, svg.trim());
  console.log(`📐 Fallback SVG created at ${filepath}`);
}

/**
 * Main function to generate all companions
 */
async function generateAllCompanions() {
  console.log('🚀 Starting companion image generation...');
  console.log(`📁 Output directory: ${outputDir}`);
  
  // Initialize OpenAI client with Azure Key Vault
  const initialized = await initializeOpenAI();
  
  if (!initialized || !openai) {
    console.error('❌ Failed to initialize OpenAI client');
    console.log('💡 Creating fallback SVGs instead...');
    
    // Create fallback SVGs for all companions
    companions.forEach(companion => {
      const svgPath = path.join(outputDir, `${companion.id}.svg`);
      createFallbackSVG(companion, svgPath);
    });
    
    return;
  }
  
  // Generate each companion
  for (const companion of companions) {
    await generateCompanionImage(companion);
    
    // Add delay to avoid rate limiting
    if (companions.indexOf(companion) < companions.length - 1) {
      console.log('⏳ Waiting 5 seconds before next image...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n✨ All companion images generated successfully!');
  console.log(`📁 Images saved to: ${outputDir}`);
}

// Run the generator
generateAllCompanions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});