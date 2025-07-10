// install and using this script 1) npm install sharp axios mkdirp 2) node process-images.js 

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const { mkdirp } = require('mkdirp');

// Configuration
const IMAGE_SPECS = {
  width: 1600,
  quality: 80,
  fit: 'cover'
};

// YOUR GITHUB PAGES IMAGE URLs
const WEATHER_IMAGES = {
  'clear-day': {
    summer: 'https://matthewdelong.github.io/weather-images/clear-day/summer.jpg',
    winter: 'https://matthewdelong.github.io/weather-images/clear-day/winter.jpg',
    default: 'https://matthewdelong.github.io/weather-images/clear-day/default.jpg'
  },
  'clear-night': {
    summer: 'https://matthewdelong.github.io/weather-images/clear-night/summer.jpg',
    winter: 'https://matthewdelong.github.io/weather-images/clear-night/winter.jpg',
    default: 'https://matthewdelong.github.io/weather-images/clear-night/default.jpg'
  },
  'partly-cloudy-day': {
    morning: 'https://matthewdelong.github.io/weather-images/partly-cloudy-day/morning.jpg',
    afternoon: 'https://matthewdelong.github.io/weather-images/partly-cloudy-day/afternoon.jpg',
    evening: 'https://matthewdelong.github.io/weather-images/partly-cloudy-day/evening.jpg',
    default: 'https://matthewdelong.github.io/weather-images/partly-cloudy-day/default.jpg'
  },
  'partly-cloudy-night': {
    early: 'https://matthewdelong.github.io/weather-images/partly-cloudy-night/early.jpg',
    late: 'https://matthewdelong.github.io/weather-images/partly-cloudy-night/late.jpg',
    default: 'https://matthewdelong.github.io/weather-images/partly-cloudy-night/default.jpg'
  },
  'rain': {
    light: 'https://matthewdelong.github.io/weather-images/rain/light.jpg',
    heavy: 'https://matthewdelong.github.io/weather-images/rain/heavy.jpg',
    default: 'https://matthewdelong.github.io/weather-images/rain/default.jpg'
  },
  'snow': {
    light: 'https://matthewdelong.github.io/weather-images/snow/light.jpg',
    heavy: 'https://matthewdelong.github.io/weather-images/snow/heavy.jpg',
    default: 'https://matthewdelong.github.io/weather-images/snow/default.jpg'
  },
  'thunderstorm': {
    light: 'https://matthewdelong.github.io/weather-images/thunderstorm/light.jpg',
    heavy: 'https://matthewdelong.github.io/weather-images/thunderstorm/heavy.jpg',
    default: 'https://matthewdelong.github.io/weather-images/thunderstorm/default.jpg'
  },
  'cloudy': 'https://matthewdelong.github.io/weather-images/cloudy.jpg',
  'mist': 'https://matthewdelong.github.io/weather-images/mist.jpg',
  'sleet': 'https://matthewdelong.github.io/weather-images/sleet.jpg',
  'wind': 'https://matthewdelong.github.io/weather-images/wind.jpg',
  'hail': 'https://matthewdelong.github.io/weather-images/hail.jpg',
  'tornado': 'https://matthewdelong.github.io/weather-images/tornado.jpg',
  'default': 'https://matthewdelong.github.io/weather-images/default.jpg'
};

async function downloadImage(url, outputPath) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 15000
    });
    await fs.promises.writeFile(outputPath, response.data);
    console.log(`✅ Downloaded ${path.basename(outputPath)}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to download ${url}: ${err.message}`);
    return false;
  }
}

async function processExistingImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize({ 
        width: IMAGE_SPECS.width,
        fit: IMAGE_SPECS.fit 
      })
      .jpeg({ 
        quality: IMAGE_SPECS.quality,
        mozjpeg: true 
      })
      .toFile(outputPath);
    console.log(`✨ Processed ${path.basename(outputPath)}`);
  } catch (err) {
    console.error(`❌ Failed to process ${inputPath}: ${err.message}`);
  }
}

async function main() {
  console.log('Starting image optimization...');
  
  // Create optimized versions of all images
  for (const [weatherType, variants] of Object.entries(WEATHER_IMAGES)) {
    if (typeof variants === 'string') {
      // Single image (like cloudy.jpg)
      const inputPath = path.join('original-images', `${weatherType}.jpg`);
      const outputPath = path.join('weather-images', `${weatherType}.jpg`);
      
      await mkdirp(path.dirname(outputPath));
      if (fs.existsSync(inputPath)) {
        await processExistingImage(inputPath, outputPath);
      } else {
        console.log(`ℹ️ ${inputPath} not found - using direct URL`);
        await downloadImage(variants, outputPath);
      }
    } else {
      // Variant images
      for (const [variant, url] of Object.entries(variants)) {
        const inputPath = path.join('original-images', weatherType, `${variant}.jpg`);
        const outputPath = path.join('weather-images', weatherType, `${variant}.jpg`);
        
        await mkdirp(path.dirname(outputPath));
        if (fs.existsSync(inputPath)) {
          await processExistingImage(inputPath, outputPath);
        } else {
          console.log(`ℹ️ ${inputPath} not found - using direct URL`);
          await downloadImage(url, outputPath);
        }
      }
    }
  }
  
  console.log('🎉 Optimization complete!');
  console.log('Upload the "weather-images" folder to GitHub.');
}

main();