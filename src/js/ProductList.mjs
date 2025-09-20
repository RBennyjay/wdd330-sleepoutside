import { renderListWithTemplate } from "./utils.mjs";

// Template for one product card
function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="../product_pages/?product=${product.Id}">
        <img src="${product.Images?.PrimaryMedium || ''}" alt="Image of ${product.NameWithoutBrand}">
        <h2 class="card__brand">${product.Brand.Name}</h2>
        <h3 class="card__name">${product.NameWithoutBrand}</h3>
        <p class="product-card__price">$${product.FinalPrice}</p>
      </a>
    </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      const products = await this.dataSource.getData(this.category);
      this.renderList(products);
    } catch (error) {
      console.error("Error loading products:", error);
      this.listElement.innerHTML = "<p>Failed to load products.</p>";
    }
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
  }
}
