// Firebase Configuration for SapnaSarees
// Replace with your actual Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "sapnasarees-89e84.firebaseapp.com",
  projectId: "sapnasarees-89e84",
  storageBucket: "sapnasarees-89e84.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

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
