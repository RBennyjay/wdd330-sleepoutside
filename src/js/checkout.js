// checkout.js
import { loadHeaderFooter, updateHeaderCartCount, getLocalStorage, setLocalStorage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

// ============================
// Helper to refresh order summary
// ============================
function refreshOrderSummary() {
  const checkout = new CheckoutProcess("cart");
  checkout.init(); // calculates and displays subtotal, tax, shipping, total
}

// ============================
// Page Initialization
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter(() => {
    // Only update the header cart count
    updateHeaderCartCount();
  });

  // Show only order summary
  refreshOrderSummary();

  // Handle checkout form submission
  const checkoutForm = document.querySelector("#checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const checkout = new CheckoutProcess("cart");
        checkout.init();

        const response = await checkout.checkout(e.target);
        alert("✅ Order placed successfully!");
        console.log(response);

        // Clear cart after successful order
        setLocalStorage("cart", []);
        refreshOrderSummary();
      } catch (err) {
        console.error(err);
        alert("❌ There was a problem processing your order.");
      }
    });
  }
});
