import { setLocalStorage, getLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // get product details
    this.product = await this.dataSource.findProductById(this.productId);

    // render details
    this.renderProductDetails();

    // attach listener to Add to Cart button
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    let cart = getLocalStorage("so-cart") || [];

    // check if product already exists in cart
    const existing = cart.find(item => item.Id === this.product.Id);

    if (existing) {
      // increment quantity if already in cart
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      // add new product with quantity 1
      this.product.quantity = 1;
      cart.push(this.product);
    }

    // save back to local storage
    setLocalStorage("so-cart", cart);
  }

  renderProductDetails() {
    // generates HTML to display product details
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
  document.querySelector("h3").textContent = product.Brand.Name;
  document.querySelector("h2").textContent = product.NameWithoutBrand;

  const productImage = document.getElementById("productImage");
  productImage.src = product.Image;
  productImage.alt = product.NameWithoutBrand;

  document.getElementById("productPrice").textContent =
    `$${product.FinalPrice}`;
  document.getElementById("productColor").textContent =
    product.Colors[0].ColorName;
  document.getElementById("productDesc").innerHTML =
    product.DescriptionHtmlSimple;

  document.getElementById("addToCart").dataset.id = product.Id;
}
