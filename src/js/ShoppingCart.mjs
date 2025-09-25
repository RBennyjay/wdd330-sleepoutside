// ShoppingCart.mjs
import { getLocalStorage, setLocalStorage, updateHeaderCartCount, renderWithTemplate } from "./utils.mjs";

export default class ShoppingCart {
  constructor(cartKey = "cart") {
    this.cartKey = cartKey;
    this.cartItems = [];
  }

  init() {
    this.loadCart();
    this.renderCart();
  }

  loadCart() {
    this.cartItems = getLocalStorage(this.cartKey) || [];
    this.mergeDuplicates();
  }

  mergeDuplicates() {
    const merged = [];
    this.cartItems.forEach(item => {
      const existing = merged.find(p => p.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push({ ...item });
      }
    });
    this.cartItems = merged;
    setLocalStorage(this.cartKey, this.cartItems);
  }

saveCart() {
  // Normalize before saving
  const normalized = this.cartItems.map(item => ({
    id: item.id || item.Id,
    name: item.name || item.NameWithoutBrand,
    price: Number(item.price || item.FinalPrice || 0),
    quantity: item.quantity !== undefined ? item.quantity : 1,
    image: item.image || item.Images?.[0]?.url || "/images/placeholder.png"
  }));

  setLocalStorage(this.cartKey, normalized);
  updateHeaderCartCount();
}


renderCart() {
  const parent = document.querySelector("#cart-items");
  if (!this.cartItems || this.cartItems.length === 0) {
    parent.innerHTML = `<p>Your cart is empty.</p>`;
    updateHeaderCartCount();
    document.querySelector(".cart-total").textContent = "0.00";
    return;
  }

  const html = this.cartItems.map((item, index) => this.cartItemTemplate(item, index)).join("");

  parent.innerHTML = html;

  const total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.querySelector(".cart-total").textContent = total.toFixed(2);

  this.attachEvents();
}


 cartItemTemplate(item, index) {
  const itemQty = item.quantity || 1;
  const itemPrice = item.price || 0;
  const itemTotal = itemPrice * itemQty;

  return `
    <div class="cart-item">
      <img src="${item.image || '/images/placeholder.png'}" alt="${item.name}" class="cart-item__image" />
      <div class="cart-item__details">
        <h3 class="cart-item__name">${item.name}</h3>
        <p class="cart-item__price">$${itemPrice.toFixed(2)}</p>
        <div class="cart-item__controls">
          <input 
            type="number" 
            min="1" 
            value="${itemQty}" 
            data-index="${index}" 
            class="qty-input" 
          />
          <span class="cart-item__subtotal">$${itemTotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `;
}


  attachEvents() {
    const removeButtons = document.querySelectorAll(".remove-btn");
    const qtyInputs = document.querySelectorAll(".qty-input");

    // Remove
    removeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        this.cartItems.splice(index, 1);
        this.saveCart();
        this.renderCart();
      });
    });

    // Update quantity
    qtyInputs.forEach(input => {
      input.addEventListener("change", () => {
        const index = parseInt(input.dataset.index);
        let qty = parseInt(input.value);
        if (isNaN(qty) || qty < 1) qty = 1;
        this.cartItems[index].quantity = qty;
        this.saveCart();
        this.renderCart();
      });
    });
  }
}
