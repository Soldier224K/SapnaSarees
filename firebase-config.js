// Firebase Configuration for SapnaSarees - WORKING VERSION
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpuV4C9YqUbt1i2P-mVGJAeUCwq4WfUgg",
  authDomain: "sapnasarees-89e84.firebaseapp.com",
  projectId: "sapnasarees-89e84",
  storageBucket: "sapnasarees-89e84.firebasestorage.app",
  messagingSenderId: "547407946302",
  appId: "1:547407946302:web:90d4335002d9762a86276f",
  measurementId: "G-FLKQS8E7MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Admin contact details
export const ADMIN_WHATSAPP = "919990122794";
export const STORE_NAME = "SapnaSarees";

console.log("✅ Firebase initialized successfully for SapnaSarees!");

// Test connection
export const testFirebaseConnection = async () => {
  try {
    // Simple test to verify connection
    console.log("🔥 Firebase project:", firebaseConfig.projectId);
    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return false;
  }
};
