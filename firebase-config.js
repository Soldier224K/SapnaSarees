// Firebase Configuration for SapnaSarees
// Replace with your actual Firebase config from Firebase Console

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Database Collections Structure:
/*
Collections:
1. products - {id, name, price, originalPrice, description, category, color, fabric, occasion, stock, imageUrl, isActive, createdAt, updatedAt}
2. orders - {id, customerId, customerInfo, items[], total, status, orderDate, deliveryAddress, pincode, phone, whatsappSent, deliveryDate}
3. customers - {id, name, email, phone, addresses[], orderHistory[]}
4. inventory - {productId, currentStock, reservedStock, lowStockAlert}
5. settings - {whatsappNumber, adminPhone, storeName, gstNumber}
*/
