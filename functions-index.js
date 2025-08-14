// Cloud Function to send free WhatsApp alert via CallMeBot API (no cost)
// Save as functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = (...args) => import('node-fetch').then(({default: fn}) => fn(...args));
admin.initializeApp();

// Change to your WhatsApp number registered on CallMeBot
const WHATSAPP_NUM = '+919990122794';
const CALLMEBOT_APIKEY = 'free'; // after registering send "I allow callmebot to send me messages" to +34 644 64 52 84

exports.sendWhatsAppOnOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, ctx) => {
    const order = snap.data();
    const text = `New Order ${orderId = ctx.params.orderId}\nName: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddr: ${order.customer.addr}\nTotal: ₹${order.total}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUM}&text=${encodeURIComponent(text)}&apikey=${CALLMEBOT_APIKEY}`;
    try {
      await fetch(url);
      await snap.ref.update({ whatsapp:true });
    } catch(e){ console.error('WhatsApp send failed',e); }
  });
