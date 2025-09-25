// cart.mjs
import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  updateCartDisplay,
  updateHeaderCartCount,
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
  const checkoutBtn = document.querySelector(".checkout-action a");

  if (!cartItems.length) {
    container.innerHTML = "<p>Your cart is empty. Add items before checkout.</p>";
    document.querySelector(".cart-total").textContent = "0.00";

    // Disable checkout button
    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.5";
    }

    updateCartDisplay();
    updateHeaderCartCount();
    return;
  }

  // Render cart items
  container.innerHTML = cartItems.map(renderCartItem).join("");

  // Enable checkout button
  if (checkoutBtn) {
    checkoutBtn.classList.remove("disabled");
    checkoutBtn.style.pointerEvents = "auto";
    checkoutBtn.style.opacity = "1";
  }

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

  // Prevent duplicate listeners
  container.replaceWith(container.cloneNode(true));
  const freshContainer = document.querySelector("#cart-items");

  freshContainer.addEventListener("click", (e) => {
    let cart = getLocalStorage("cart") || [];
    const id = String(e.target.dataset.id); // normalize ID

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
    updateHeaderCartCount();
  });
}

// Initialize cart page
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter(() => {
    renderCartItems();
    attachCartEvents();
  });

  // Optional: redirect if cart is empty and user tries to manually access checkout
  const checkoutUrl = "/checkout/index.html";
  const checkoutLink = document.querySelector(".checkout-action a");
  if (checkoutLink) {
    checkoutLink.addEventListener("click", (e) => {
      const cart = getLocalStorage("cart") || [];
      if (!cart.length) {
        e.preventDefault();
        window.location.href = "/index.html";
      }
    });
  }
});
