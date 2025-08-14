// SapnaSarees Firebase Operations
import { db, storage } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Admin/Seller Contact Details
const ADMIN_WHATSAPP = "919990122794";
const STORE_NAME = "SapnaSarees";

class SapnaSareesManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('sapna_cart')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('sapna_user')) || null;
  }

  // ============= PRODUCT MANAGEMENT =============
  
  async addProduct(productData, imageFile = null) {
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const product = {
        ...productData,
        imageUrl,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), product);
      console.log("Product added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }

  async updateProductPrice(productId, newPrice, originalPrice = null) {
    try {
      const productRef = doc(db, 'products', productId);
      const updateData = {
        price: newPrice,
        updatedAt: serverTimestamp()
      };
      
      if (originalPrice) {
        updateData.originalPrice = originalPrice;
      }

      await updateDoc(productRef, updateData);
      console.log("Price updated successfully");
      
      // Update local display
      this.refreshProducts();
    } catch (error) {
      console.error("Error updating price:", error);
      throw error;
    }
  }

  async updateStock(productId, newStock) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp()
      });
      
      // Show low stock alert if needed
      if (newStock < 5) {
        this.showNotification(`⚠️ Low stock alert: ${newStock} items remaining for product ${productId}`, 'warning');
      }
      
      this.refreshProducts();
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  }

  async loadProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return products;
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    }
  }

  // ============= ORDER MANAGEMENT =============
  
  async placeOrder(customerInfo, deliveryAddress) {
    try {
      if (this.cart.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate total
      const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Generate order ID
      const orderId = `ORD${Date.now()}`;
      
      const orderData = {
        orderId,
        customerInfo,
        deliveryAddress,
        items: [...this.cart],
        total,
        status: 'confirmed',
        orderDate: serverTimestamp(),
        whatsappSent: false,
        smsSent: false
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Update inventory
      await this.updateInventoryAfterOrder();
      
      // Send WhatsApp notification to admin
      await this.sendWhatsAppToSeller(orderData);
      
      // Clear cart
      this.cart = [];
      localStorage.removeItem('sapna_cart');
      
      // Show success message
      this.showNotification(`Order ${orderId} placed successfully! 🎉`, 'success');
      
      return {
        success: true,
        orderId: docRef.id,
        orderNumber: orderId
      };
      
    } catch (error) {
      console.error("Error placing order:", error);
      this.showNotification("Failed to place order. Please try again.", 'error');
      throw error;
    }
  }

  async updateInventoryAfterOrder() {
    for (const item of this.cart) {
      try {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      } catch (error) {
        console.error(`Error updating stock for product ${item.id}:`, error);
      }
    }
  }

  // ============= WHATSAPP INTEGRATION =============
  
  async sendWhatsAppToSeller(orderData) {
    try {
      const message = this.formatWhatsAppMessage(orderData);
      
      // Using WhatsApp Business API (you'll need to implement this with your provider)
      const whatsappData = {
        to: ADMIN_WHATSAPP,
        message: message,
        orderNumber: orderData.orderId
      };

      // For now, we'll simulate the WhatsApp API call
      console.log("WhatsApp Message to Seller:", message);
      
      // In production, integrate with services like:
      // - Twilio WhatsApp API
      // - WhatsApp Business Cloud API
      // - Gupshup WhatsApp API
      
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappData)
      });

      if (response.ok) {
        // Update order to mark WhatsApp as sent
        const orderRef = doc(db, 'orders', orderData.orderId);
        await updateDoc(orderRef, {
          whatsappSent: true,
          whatsappSentAt: serverTimestamp()
        });
        
        console.log("WhatsApp notification sent successfully");
      }
      
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
    }
  }

  formatWhatsAppMessage(orderData) {
    const itemsList = orderData.items.map(item => 
      `• ${item.title} - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`
    ).join('\n');

    return `🛍️ *New Order - ${STORE_NAME}*

📋 *Order ID:* ${orderData.orderId}
👤 *Customer:* ${orderData.customerInfo.name}
📞 *Phone:* ${orderData.customerInfo.phone}
📧 *Email:* ${orderData.customerInfo.email}

🛒 *Items Ordered:*
${itemsList}

💰 *Total Amount:* ₹${orderData.total}

📍 *Delivery Address:*
${orderData.deliveryAddress.street}
${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state}
📮 *Pincode:* ${orderData.deliveryAddress.pincode}

⏰ *Order Time:* ${new Date().toLocaleString('en-IN')}

Please prepare the order for dispatch. 📦✨`;
  }

  // ============= CART MANAGEMENT =============
  
  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        ...product,
        quantity
      });
    }
    
    localStorage.setItem('sapna_cart', JSON.stringify(this.cart));
    this.updateCartUI();
    this.showNotification(`${product.title} added to cart!`, 'success');
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    localStorage.setItem('sapna_cart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem('sapna_cart', JSON.stringify(this.cart));
      this.updateCartUI();
    }
  }

  // ============= UI HELPERS =============
  
  updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartCount) return;

    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalAmount.toLocaleString();

    if (cartItems) {
      cartItems.innerHTML = this.cart.length === 0 ? 
        '<p style="text-align: center; color: #999; margin-top: 40px;">Your cart is empty</p>' :
        this.cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-image" style="background-image: url('${item.imageUrl || ''}'); background-size: cover;"></div>
            <div class="cart-item-info">
              <div class="cart-item-title">${item.title || item.name}</div>
              <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
              <div class="quantity-controls">
                <button class="qty-btn" onclick="sapnaManager.updateCartQuantity('${item.id}', ${item.quantity - 1})">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="sapnaManager.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                <button class="remove-btn" onclick="sapnaManager.removeFromCart('${item.id}')" style="margin-left: 10px; color: red;">🗑️</button>
              </div>
            </div>
          </div>
        `).join('');
    }
  }

  showNotification(message, type = 'info') {
    const toast = document.getElementById('toast') || this.createToast();
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  createToast() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = '<span id="toast-message"></span>';
    document.body.appendChild(toast);
    return toast;
  }

  async refreshProducts() {
    const products = await this.loadProducts();
    this.displayProducts(products);
  }

  displayProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image" style="background-image: url('${product.imageUrl || ''}'); background-size: cover;">
          ${!product.imageUrl ? (product.name || 'Product Image') : ''}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            ₹${product.price.toLocaleString()}
            ${product.originalPrice && product.originalPrice > product.price ? 
              `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''
            }
          </div>
          <p class="product-description">${product.description}</p>
          <span class="stock-status ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}">
            ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </span>
          <button class="add-to-cart" 
                  onclick="sapnaManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)"
                  ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          ${this.isAdmin() ? `
            <div class="admin-controls" style="margin-top: 10px;">
              <input type="number" id="price-${product.id}" value="${product.price}" style="width: 80px;">
              <button onclick="sapnaManager.updateProductPrice('${product.id}', document.getElementById('price-${product.id}').value)" 
                      style="background: var(--elegant-gold); border: none; padding: 5px 10px; border-radius: 4px;">
                Update Price
              </button>
              <br>
              <input type="number" id="stock-${product.id}" value="${product.stock}" style="width: 60px; margin-top: 5px;">
              <button onclick="sapnaManager.updateStock('${product.id}', document.getElementById('stock-${product.id}').value)" 
                      style="background: var(--modern-green); border: none; padding: 5px 10px; border-radius: 4px; color: white;">
                Update Stock
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  isAdmin() {
    // Simple admin check - in production use proper authentication
    return localStorage.getItem('sapna_admin') === 'true';
  }

  toggleAdmin() {
    const isAdmin = localStorage.getItem('sapna_admin') === 'true';
    localStorage.setItem('sapna_admin', (!isAdmin).toString());
    location.reload();
  }
}

// Initialize the manager
const sapnaManager = new SapnaSareesManager();

// Make it globally available
window.sapnaManager = sapnaManager;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const products = await sapnaManager.loadProducts();
    sapnaManager.displayProducts(products);
    sapnaManager.updateCartUI();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

export default sapnaManager;
