// ProductDetails.mjs
import { getLocalStorage, setLocalStorage, updateHeaderCartCount } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.cartKey = "cart"; // matches ShoppingCart default
  }

  async init() {
    // Get product details
    this.product = await this.dataSource.findProductById(this.productId);

    // Render product details
    this.renderProductDetails();

    // Attach "Add to Cart" button
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    // Load cart
    const cart = getLocalStorage(this.cartKey) || [];

    // Check if product already exists
    const existing = cart.find(item => item.Id === this.product.Id);

    if (existing) {
      // Increment quantity
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      // Add new product with quantity 1
      const productToAdd = { ...this.product, quantity: 1 };
      cart.push(productToAdd);
    }

    // Save cart
    setLocalStorage(this.cartKey, cart);

    // Update header cart count
    updateHeaderCartCount();

    // Optional: refresh checkout page if already open
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
        src="${product.Image}"
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
