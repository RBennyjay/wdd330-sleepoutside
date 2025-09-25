import { loadHeaderFooter, updateHeaderCartCount } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

// ============================
// Refresh order summary
// ============================
function refreshOrderSummary() {
  const checkout = new CheckoutProcess("cart");
  checkout.init(); // calculates and displays subtotal, tax, shipping, total
}

// ============================
// Show persistent alert
// ============================
function showAlert(message, type = "error") {
  const alertsContainer = document.querySelector("#checkout-alerts");
  if (!alertsContainer) return;

  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerHTML = `
    <span class="alert-message">${message}</span>
    <button class="alert-close">&times;</button>
  `;

  alertsContainer.appendChild(alert);

  // Close alert on click
  alert.querySelector(".alert-close").addEventListener("click", () => {
    alert.remove();
  });

  // Scroll to top so user sees the alert
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================
// Page Initialization
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer
  await loadHeaderFooter(() => {
    updateHeaderCartCount();
  });

  // Refresh order summary
  refreshOrderSummary();

  // Check cart
  const checkout = new CheckoutProcess("cart");
  checkout.init();
  if (checkout.list.length === 0) {
    showAlert("Your cart is empty. Add items before checkout.", "error");
    const checkoutForm = document.querySelector("#checkout-form");
    if (checkoutForm) checkoutForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  // Handle checkout form submission
  const checkoutForm = document.querySelector("#checkout-form");
  if (!checkoutForm) return;

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Clear previous alerts
    const alertsContainer = document.querySelector("#checkout-alerts");
    if (alertsContainer) alertsContainer.innerHTML = "";

    const { fname, lname, street, city, state, zip, cardNumber, expiration, code } = checkoutForm;

    let hasError = false;

    // Customer info validation
    if (!fname.value.trim()) { showAlert("First Name is required."); hasError = true; }
    if (!lname.value.trim()) { showAlert("Last Name is required."); hasError = true; }
    if (!street.value.trim()) { showAlert("Street Address is required."); hasError = true; }
    if (!city.value.trim()) { showAlert("City is required."); hasError = true; }
    if (!state.value.trim()) { showAlert("State is required."); hasError = true; }
    if (!zip.value.trim() || !/^\d{5}(-\d{4})?$/.test(zip.value.trim())) { showAlert("Invalid Zip Code."); hasError = true; }

    // Payment info validation
    if (!cardNumber.value.trim() || !/^\d{16}$/.test(cardNumber.value.trim())) { showAlert("Invalid Card Number."); hasError = true; }
    if (!expiration.value.trim() || !/^\d{2}\/\d{2}$/.test(expiration.value.trim())) { showAlert("Invalid Expiration Date."); hasError = true; }
    if (!code.value.trim() || !/^\d{3,4}$/.test(code.value.trim())) { showAlert("Invalid Security Code."); hasError = true; }

    if (hasError) return;

    try {
      // Proceed with checkout
      await checkout.checkout(e.target);

      // Refresh order summary after cart is cleared
      refreshOrderSummary();

      // Show success alert
      showAlert("✅ Order placed successfully!", "success");

      // Reset form
      checkoutForm.reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);

    } catch (err) {
      console.error(err);
      showAlert("❌ There was a problem processing your order.", "error");
    }
  });
});
