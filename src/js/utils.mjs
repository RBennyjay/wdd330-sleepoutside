// utils.mjs

// ===========================
// DOM helpers
// ===========================
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// ===========================
// LocalStorage helpers
// ===========================
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===========================
// Event helpers
// ===========================
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// ===========================
// URL helpers
// ===========================
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// ===========================
// Rendering helpers
// ===========================
export function renderListWithTemplate(
  template,
  parentElement,
  list,
  position = "afterbegin",
  clear = true
) {
  if (clear) parentElement.innerHTML = "";
  const htmlItems = list.map(template).join("");
  parentElement.insertAdjacentHTML(position, htmlItems);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  return await res.text();
}

export async function loadHeaderFooter(callback) {
  const headerTemplate = await loadTemplate("../partials/header.html");
  const footerTemplate = await loadTemplate("../partials/footer.html");

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  headerElement.innerHTML = headerTemplate;
  footerElement.innerHTML = footerTemplate;

  // Update cart count after header is loaded
  updateHeaderCartCount();

  // Load tent icon after header is in the DOM
  loadTentIcon("#logo");

  if (callback) callback();
}

// ===========================
// Header cart count
// ===========================
export function updateHeaderCartCount() {
  const cartCountSpan = document.querySelector("#main-header .cart-count");
  if (cartCountSpan) {
    const cart = getLocalStorage("cart") || [];
    let count = 0;
    cart.forEach((item) => (count += item.quantity));

    if (count > 0) {
      cartCountSpan.textContent = count;
      cartCountSpan.style.display = "inline-block";
    } else {
      cartCountSpan.textContent = "";
      cartCountSpan.style.display = "none";
    }
  }
}

// ===========================
// Cart Quantity & Price Update
// ===========================

// Update a cart item's quantity in localStorage and refresh totals
export function updateCartItemQuantity(productId, newQuantity) {
  const cart = getLocalStorage("cart") || [];
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.quantity = Math.max(1, newQuantity); // prevent quantity < 1
  setLocalStorage("cart", cart);
  updateCartDisplay();
  updateHeaderCartCount();
}

// Recalculate item totals and overall cart total
export function updateCartDisplay() {
  const cart = getLocalStorage("cart") || [];
  let total = 0;

  cart.forEach((item) => {
    const itemRow = document.querySelector(`.cart-item[data-id="${item.id}"]`);
    if (itemRow) {
      const itemTotalEl = itemRow.querySelector(".item-total");
      if (itemTotalEl) {
        itemTotalEl.textContent = (item.price * item.quantity).toFixed(2);
      }
      const inputEl = itemRow.querySelector(".item-quantity");
      if (inputEl) {
        inputEl.value = item.quantity;
      }
    }
    total += item.price * item.quantity;
  });

  const cartTotalEl = document.querySelector(".cart-total");
  if (cartTotalEl) {
    cartTotalEl.textContent = total.toFixed(2);
  }
}

export function removeCartItem(productId) {
  let cart = getLocalStorage("cart") || [];
  cart = cart.filter((item) => item.id !== productId);
  setLocalStorage("cart", cart);

  // Remove from DOM
  const itemRow = document.querySelector(`.cart-item[data-id="${productId}"]`);
  if (itemRow) {
    itemRow.remove();
  }

  updateCartDisplay();
  updateHeaderCartCount(); // live update
}

// Attach event listeners to increment/decrement/remove buttons
export function attachQuantityListeners() {
  document.querySelectorAll(".decrement").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      const input = document.querySelector(
        `.item-quantity[data-id="${productId}"]`
      );
      const newQuantity = parseInt(input.value) - 1;
      input.value = Math.max(1, newQuantity);
      updateCartItemQuantity(productId, newQuantity);
    });
  });

  document.querySelectorAll(".increment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      const input = document.querySelector(
        `.item-quantity[data-id="${productId}"]`
      );
      const newQuantity = parseInt(input.value) + 1;
      input.value = newQuantity;
      updateCartItemQuantity(productId, newQuantity);
    });
  });

  // Manual input change
  document.querySelectorAll(".item-quantity").forEach((input) => {
    input.addEventListener("change", () => {
      const productId = input.dataset.id;
      const newQuantity = Math.max(1, parseInt(input.value));
      input.value = newQuantity;
      updateCartItemQuantity(productId, newQuantity);
    });
  });

  // Remove item button
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      removeCartItem(productId);
    });
  });
}

// ===========================
// Tent Icon
// ===========================
import tentIcon from "../images/noun_Tent_2517.svg";

export function loadTentIcon(selector = "#logo") {
  const el = qs(selector);
  if (el) {
    el.src = tentIcon; // Vite will handle the correct path in production
  } else {
    console.warn(`No element found for selector: ${selector}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTentIcon("#logo");
});
