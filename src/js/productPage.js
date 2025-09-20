import { loadHeaderFooter, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Load header and footer into placeholders
loadHeaderFooter();

// Grab product id from query string (?product=xxx)
const productId = getParam("product");

// Create data source (using "tents" category)
const dataSource = new ProductData("tents");

// Initialize ProductDetails for this product
const product = new ProductDetails(productId, dataSource);
product.init();
