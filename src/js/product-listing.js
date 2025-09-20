// product-listing.js
import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { loadHeaderFooter, getParam } from './utils.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  // Load header/footer
  await loadHeaderFooter();

  // Get category from URL (?category=tents)
  const category = getParam('category');
  if (!category) {
    console.error('No category specified in URL.');
    return;
  }
  console.log('Category:', category); // Debug

  // Find the product list container
  const listElement = document.querySelector('.product-list');
  if (!listElement) {
    console.error('No element with class "product-list" found.');
    return;
  }

  // Create ProductData instance
  const dataSource = new ProductData();

  // Create ProductList instance
  const myList = new ProductList(category, dataSource, listElement);

  // Initialize ProductList (fetch and render products)
  await myList.init();

  // Optional: Update page title with category
  const titleElement = document.querySelector('h2');
  if (titleElement) {
    titleElement.textContent = `Top Products: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  }
});
