const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const { mkdirp } = require('mkdirp');

// Configuration - EDIT THESE VALUES
const IMAGE_SPECS = {
  width: 1600,     // Target width in pixels
  quality: 80,     // JPEG quality (1-100)
  fit: 'cover'     // Crop mode ('cover' = Unsplash-style crop)
};

const WEATHER_IMAGES = {
  'clear-day': {
    summer: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b',
    winter: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5',
    default: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
  },
  // Add other weather conditions here following the same pattern
  'clear-night': {
    summer: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986',
    default: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986'
  }
};

async function processImage(url, outputPath) {
  try {
    console.log(`⬇️ Downloading ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    await sharp(response.data)
      .resize({ 
        width: IMAGE_SPECS.width,
        fit: IMAGE_SPECS.fit 
      })
      .jpeg({ 
        quality: IMAGE_SPECS.quality,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    console.log(`✅ Saved to ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed ${url}: ${err.message}`);
  }
}

async function main() {
  console.log('Starting image processing...');
  for (const [weatherType, variants] of Object.entries(WEATHER_IMAGES)) {
    for (const [variant, url] of Object.entries(variants)) {
      const dir = path.join('weather-images', weatherType);
      await mkdirp(dir);
      const outputPath = path.join(dir, `${variant}.jpg`);
      await processImage(url, outputPath);
    }
  }
  console.log('All done! Upload the "weather-images" folder to GitHub.');
}

main();