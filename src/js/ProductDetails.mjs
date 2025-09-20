import { getLocalStorage, setLocalStorage, updateHeaderCartCount } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.cartKey = "cart"; // matches ShoppingCart default key
  }

  async init() {
    try {
      // Fetch product details from API
      this.product = await this.dataSource.findProductById(this.productId);

      // Render product details
      this.renderProductDetails();

      // Attach "Add to Cart" button listener
      document
        .getElementById("addToCart")
        .addEventListener("click", this.addProductToCart.bind(this));

    } catch (error) {
      console.error("Failed to load product details:", error);
      const element = document.querySelector("#productDetails");
      element.innerHTML = "<p>Sorry, this product could not be loaded.</p>";
    }
  }

  addProductToCart() {
    const cart = getLocalStorage(this.cartKey) || [];

    // Check if product already exists in cart
    const existing = cart.find(item => item.Id === this.product.Id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      // Use PrimaryLarge for detail page or fallback to PrimaryMedium
      const productToAdd = {
        ...this.product,
        Image: this.product.Images?.PrimaryLarge || this.product.Images?.PrimaryMedium || '',
        quantity: 1
      };
      cart.push(productToAdd);
    }

    setLocalStorage(this.cartKey, cart);
    updateHeaderCartCount();

    // Refresh checkout table if open
    const checkoutTable = document.querySelector(".checkout-table");
    if (checkoutTable) {
      const shoppingCart = new ShoppingCart(this.cartKey);
      shoppingCart.init();
    }
  }

  renderProductDetails() {
    const element = document.querySelector("#productDetails");
    element.innerHTML = this.productTemplate(this.product);
  }

  productTemplate(product) {
    return `
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="divider">${product.NameWithoutBrand}</h2>

      <img 
        class="divider"
        src="${product.Images?.PrimaryLarge || product.Images?.PrimaryMedium || ''}"
        alt="${product.NameWithoutBrand}"
      />

      <p class="product-card__price">$${product.FinalPrice}</p>
      <p class="product__color">${product.Colors?.[0]?.ColorName || ""}</p>
      <p class="product__description">${product.DescriptionHtmlSimple}</p>

      <div class="product-detail__add">
        <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
      </div>
    `;
  }
}
