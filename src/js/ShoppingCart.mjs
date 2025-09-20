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
      const existing = merged.find(p => p.Id === item.Id);
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
    setLocalStorage(this.cartKey, this.cartItems);
    updateHeaderCartCount();
  }

  renderCart() {
    const parent = document.querySelector(".products");
    if (!this.cartItems || this.cartItems.length === 0) {
      parent.innerHTML = `<p>Your cart is empty.</p>`;
      updateHeaderCartCount();
      return;
    }

    const html = this.cartItems.map((item, index) => this.cartItemTemplate(item, index)).join("");

    const total = this.cartItems.reduce((sum, item) => sum + (item.FinalPrice * item.quantity), 0);

    const fullTemplate = `
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
          ${html}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td colspan="2"><strong>$${total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    renderWithTemplate(fullTemplate, parent);

    // Attach events
    this.attachEvents();
  }

  cartItemTemplate(item, index) {
    const itemQty = item.quantity || 1;
    const itemPrice = item.FinalPrice || 0;
    const itemTotal = itemPrice * itemQty;

    return `
      <tr>
        <td>${item.NameWithoutBrand}</td>
        <td><input type="number" min="1" value="${itemQty}" data-index="${index}" class="qty-input" /></td>
        <td>$${itemPrice.toFixed(2)}</td>
        <td class="item-total">$${itemTotal.toFixed(2)}</td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      </tr>
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
