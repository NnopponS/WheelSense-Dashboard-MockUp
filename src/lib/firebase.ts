/**
 * Firebase Configuration and Initialization
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://wheelsense-201ae-default-rtdb.firebaseio.com/',
  // Note: For production, you should add these values from Firebase Console
  // apiKey: process.env.VITE_FIREBASE_API_KEY,
  // authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let database: Database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  throw error;
}

export { database };
export default app;

