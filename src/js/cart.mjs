// cart.mjs
import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  updateCartDisplay,
  updateHeaderCartCount, //  import this
} from "./utils.mjs";

function renderCartItem(item) {
  return `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image || '/images/placeholder.png'}" 
           alt="${item.name}" 
           class="cart-item-image">

      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.name}</h3>
        <div class="cart-item-quantity">
          <button class="qty-btn decrease" data-id="${item.id}">-</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn increase" data-id="${item.id}">+</button>
        </div>
      </div>

      <div class="cart-item-price">
        $${(item.price * item.quantity).toFixed(2)}
      </div>

      <button class="remove-btn" data-id="${item.id}">Remove</button>
    </div>
  `;
}

function renderCartItems() {
  const cartItems = getLocalStorage("cart") || [];
  const container = document.querySelector("#cart-items");

  if (!cartItems.length) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    document.querySelector(".cart-total").textContent = "0.00";
    updateCartDisplay();
    updateHeaderCartCount(); //  keep badge synced
    return;
  }

  // Render cart items
  container.innerHTML = cartItems.map(renderCartItem).join("");

  // Update total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  document.querySelector(".cart-total").textContent = total.toFixed(2);

  // Update both cart page & header badge
  updateCartDisplay();
  updateHeaderCartCount();
}

function attachCartEvents() {
  const container = document.querySelector("#cart-items");

  container.addEventListener("click", (e) => {
    let cart = getLocalStorage("cart") || [];
    const id = e.target.dataset.id;

    if (e.target.classList.contains("increase")) {
      const item = cart.find(p => p.id === id);
      if (item) item.quantity++;
    }

    if (e.target.classList.contains("decrease")) {
      const item = cart.find(p => p.id === id);
      if (item && item.quantity > 1) item.quantity--;
    }

    if (e.target.classList.contains("remove-btn")) {
      cart = cart.filter(p => p.id !== id);
    }

    setLocalStorage("cart", cart);
    renderCartItems(); // re-render after every change
    updateHeaderCartCount(); // make sure badge updates immediately
  });
}

// Initialize cart page
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter(() => {
    renderCartItems();
    attachCartEvents();
  });
});
