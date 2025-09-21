// utils.mjs

// wrapper for querySelector
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localStorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// return parameter from URL
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// ===========================
// Render list of items with a template
// ===========================
export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = true) {
  if (clear) parentElement.innerHTML = "";
  const htmlItems = list.map(template).join("");
  parentElement.insertAdjacentHTML(position, htmlItems);
}

// ===========================
// Render a single HTML string with optional callback
// ===========================
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

// fetch and return template file as text
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  return await res.text();
}

// load header and footer templates
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

// Update header cart count automatically from localStorage
export function updateHeaderCartCount() {
  const cartCountSpan = document.querySelector("#main-header .cart-count");
  if (cartCountSpan) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let count = 0;
    cart.forEach(item => count += item.quantity);
    cartCountSpan.textContent = count;
  }
}

// ===========================
// Load tent icon for header
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

// Automatically load tent icon when DOM is ready 
document.addEventListener("DOMContentLoaded", () => {
  loadTentIcon("#logo");
});
