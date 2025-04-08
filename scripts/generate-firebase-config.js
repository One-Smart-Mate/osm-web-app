// scripts/generate-firebase-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateFirebaseConfig = () => {
  console.log('\n[Firebase Config Generator] Starting configuration generation...');
  
  try {
    const configTemplate = fs.readFileSync(
      path.resolve(__dirname, '../public/firebase-config.js'),
      'utf8'
    );
    
    console.log('[Firebase Config Generator] Template loaded successfully');
    
    // Verify that environment variables are defined
    const envVars = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASURE_ID,
      vapidKey: process.env.VITE_FIREBASE_VAPID_KEY
    };
    
    // Check if any variable is missing
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      console.warn(`[Firebase Config Generator] WARNING: The following environment variables are missing: ${missingVars.join(', ')}`);
    } else {
      console.log('[Firebase Config Generator] All environment variables are present');
    }

    // Replace placeholders with actual environment variables
    const configWithEnvVars = configTemplate
      .replace('__FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY || '')
      .replace('__FIREBASE_DOMAIN__', process.env.VITE_FIREBASE_DOMAIN || '')
      .replace('__FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID || '')
      .replace('__FIREBASE_BUCKET__', process.env.VITE_FIREBASE_BUCKET || '')
      .replace('__FIREBASE_MESSAGING_ID__', process.env.VITE_FIREBASE_MESSAGING_ID || '')
      .replace('__FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID || '')
      .replace('__FIREBASE_MEASURE_ID__', process.env.VITE_FIREBASE_MEASURE_ID || '');

    fs.writeFileSync(
      path.resolve(__dirname, '../public/firebase-config.js'),
      configWithEnvVars,
      'utf8'
    );

    // Verify that the file doesn't contain placeholders
    const generatedConfig = fs.readFileSync(
      path.resolve(__dirname, '../public/firebase-config.js'),
      'utf8'
    );
    
    const containsPlaceholders = generatedConfig.includes('__FIREBASE');
    if (containsPlaceholders) {
      console.warn('[Firebase Config Generator] WARNING: The generated file still contains placeholders');
    } else {
      console.log('[Firebase Config Generator] Configuration file generated successfully without placeholders');
    }
    
    console.log('[Firebase Config Generator] File path:', path.resolve(__dirname, '../public/firebase-config.js'));
  } catch (error) {
    console.error('[Firebase Config Generator] Error generating configuration:', error);
  }
};

generateFirebaseConfig();
