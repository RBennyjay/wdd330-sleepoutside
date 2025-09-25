import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(key = "cart") {
    this.key = key;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    const raw = getLocalStorage(this.key) || [];
    this.list = raw.map(item => ({
      id: item.id || item.Id,
      name: item.name || item.NameWithoutBrand,
      price: parseFloat(item.price || item.FinalPrice || 0),
      quantity: parseInt(item.quantity || 1, 10)
    }));
    this.calculateTotals();
  }

  getCartItems() {
    return this.list;
  }

  calculateTotals() {
    this.itemTotal = this.list.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.tax = this.itemTotal * 0.06;
    this.shipping = this.list.length > 0 ? 10 + (this.list.length - 1) * 2 : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayTotals();
  }

  displayTotals() {
    const subtotalEl = document.querySelector("#subtotal");
    const taxEl = document.querySelector("#tax");
    const shippingEl = document.querySelector("#shipping");
    const orderTotalEl = document.querySelector("#orderTotal");

    if (subtotalEl) subtotalEl.innerText = `$${this.itemTotal.toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = `$${this.shipping.toFixed(2)}`;
    if (orderTotalEl) orderTotalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems() {
    return this.list.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
  }

  validateForm(form) {
    const inputs = form.querySelectorAll("input[required]");
    for (const input of inputs) {
      if (!input.value.trim()) {
        input.focus();
        return { valid: false, message: `Please fill in the ${input.name} field.` };
      }
    }
    return { valid: true };
  }

  async checkout(form) {
    if (!this.list || this.list.length === 0) {
      throw new Error("Cart is empty. Add items before checkout.");
    }

    const validation = this.validateForm(form);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const formData = new FormData(form);
    const customerData = {};
    formData.forEach((value, key) => (customerData[key] = value));

    const order = {
      ...customerData,
      orderDate: new Date().toISOString(),
      items: this.packageItems(),
      orderTotal: this.orderTotal.toFixed(2),
      shipping: this.shipping,
      tax: this.tax.toFixed(2)
    };

    try {
      const services = new ExternalServices();
      const result = await services.checkout(order);

      // Clear cart
      setLocalStorage(this.key, []);

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

      return result;
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      throw err; // propagate error to page script
    }
  }
}
