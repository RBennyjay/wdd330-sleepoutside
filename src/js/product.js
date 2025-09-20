import { getParam, loadHeaderFooter, getLocalStorage, setLocalStorage, updateHeaderCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Load header/footer
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter(() => {
    setupProduct();
    updateHeaderCartCount(); // Update cart count when header is ready
  });
});

function setupProduct() {
  const productId = getParam("product");
  const dataSource = new ProductData("tents");
  const product = new ProductDetails(productId, dataSource);

  product.init({
    onAddToCart: (item) => {
      // Add item to localStorage cart
      const cart = getLocalStorage("cart") || [];
      const existingItem = cart.find(ci => ci.id === item.id);

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.push(item);
      }

      setLocalStorage("cart", cart);
      updateHeaderCartCount(); // Update header cart immediately
    }
  });
}
