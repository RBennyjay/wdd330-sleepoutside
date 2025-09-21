// checkout.js
import { loadHeaderFooter, updateHeaderCartCount, getLocalStorage, setLocalStorage } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter(() => {
    const cart = new ShoppingCart();
    cart.init();
  });
});

// Get cart items from localStorage
function getCartItems() {
  return getLocalStorage("cart") || [];
}

// Save cart items to localStorage
function saveCartItems(cart) {
  setLocalStorage("cart", cart);
}

// Display cart items in table
function displayCartItems() {
  const cartItems = getCartItems();
  const productsSection = document.querySelector(".products");

  if (!cartItems || cartItems.length === 0) {
    productsSection.innerHTML = `
      <h2>Review & Place your Order</h2>
      <p>Your cart is empty.</p>
    `;
    updateHeaderCartCount();
    return;
  }

  // Merge duplicates by product ID
  const mergedCart = [];
  cartItems.forEach(item => {
    const existing = mergedCart.find(p => p.Id === item.Id);
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      mergedCart.push({ ...item });
    }
  });

  let totalAmount = 0;

  let html = `
    <h2>Review & Place your Order</h2>
    <table class="checkout-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  mergedCart.forEach((item, index) => {
    const itemQty = item.quantity || 1;
    const itemPrice = item.FinalPrice || 0;
    const itemTotal = itemQty * itemPrice;
    totalAmount += itemTotal;

    html += `
      <tr>
        <td>${item.NameWithoutBrand}</td>
        <td><input type="number" min="1" value="${itemQty}" data-index="${index}" class="qty-input" /></td>
        <td>$${itemPrice.toFixed(2)}</td>
        <td class="item-total">$${itemTotal.toFixed(2)}</td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      </tr>
    `;
  });

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3"><strong>Total</strong></td>
          <td colspan="2"><strong>$${totalAmount.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `;

  productsSection.innerHTML = html;

  // Save merged cart back to localStorage
  saveCartItems(mergedCart);

  // Update header cart icon
  updateHeaderCartCount();

  // Attach remove and quantity change events
  attachCartEvents(mergedCart);
}

// Attach event listeners
function attachCartEvents(cart) {
  const removeButtons = document.querySelectorAll(".remove-btn");
  const qtyInputs = document.querySelectorAll(".qty-input");

  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      saveCartItems(cart);
      displayCartItems();
    });
  });

  qtyInputs.forEach(input => {
    input.addEventListener("change", () => {
      const index = parseInt(input.dataset.index);
      let newQty = parseInt(input.value);
      if (isNaN(newQty) || newQty < 1) newQty = 1;

      cart[index].quantity = newQty;
      saveCartItems(cart);
      displayCartItems();
    });
  });
}
