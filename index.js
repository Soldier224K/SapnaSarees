const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios  = require('axios');

admin.initializeApp();
const db = admin.firestore();

exports.sendWhatsAppWhenNewOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();

    // Build message identical to sapna-manager.js
    const text = `🛍 New Order ${order.orderId}\nTotal: ₹${order.total}\nAddress: ${order.deliveryAddress.street}, ${order.deliveryAddress.pincode}`;

    // Call your WhatsApp provider
    await axios.post('https://api.twilio.com/…', {
      to: 'whatsapp:+918766028985',
      body: text
    });

    // Flag as sent
    await snap.ref.update({ whatsappSent: true });
  });
