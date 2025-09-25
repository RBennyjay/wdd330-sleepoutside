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
export function updateCartItemQuantity(productId, newQuantity) {
  const cart = getLocalStorage("cart") || [];
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.quantity = Math.max(1, newQuantity);
  setLocalStorage("cart", cart);
  updateCartDisplay();
  updateHeaderCartCount();
}

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

  const itemRow = document.querySelector(`.cart-item[data-id="${productId}"]`);
  if (itemRow) itemRow.remove();

  updateCartDisplay();
  updateHeaderCartCount();
}

export function attachQuantityListeners() {
  document.querySelectorAll(".decrement").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      const input = document.querySelector(`.item-quantity[data-id="${productId}"]`);
      const newQuantity = parseInt(input.value) - 1;
      input.value = Math.max(1, newQuantity);
      updateCartItemQuantity(productId, newQuantity);
    });
  });

  document.querySelectorAll(".increment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      const input = document.querySelector(`.item-quantity[data-id="${productId}"]`);
      const newQuantity = parseInt(input.value) + 1;
      input.value = newQuantity;
      updateCartItemQuantity(productId, newQuantity);
    });
  });

  document.querySelectorAll(".item-quantity").forEach((input) => {
    input.addEventListener("change", () => {
      const productId = input.dataset.id;
      const newQuantity = Math.max(1, parseInt(input.value));
      input.value = newQuantity;
      updateCartItemQuantity(productId, newQuantity);
    });
  });

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
    el.src = tentIcon;
  } else {
    console.warn(`No element found for selector: ${selector}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTentIcon("#logo");
});

// ===========================
// Alert / Notification
// ===========================
export function alertMessage(message, type = "error", scroll = true) {
  const alert = document.createElement("div");
  alert.classList.add("alert");

  // Map type to correct CSS class
  if (type === "success") alert.classList.add("alert-success");
  else alert.classList.add("alert-error"); // red for errors

  // Set inner HTML
  alert.innerHTML = `
    <span class="alert-message">${message}</span>
    <button class="alert-close">&times;</button>
  `;

  // Close button functionality
  alert.querySelector(".alert-close").addEventListener("click", () => {
    alert.remove();
  });

  // Prepend to main content
  const main = document.querySelector("main") || document.body;
  main.prepend(alert);

  // Scroll to top if needed
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);

  return alert;
}
