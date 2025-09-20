import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("cart") || []; // fallback to empty array
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  const listElement = document.querySelector(".product-list");
  if (listElement) {
    listElement.innerHTML = htmlItems.join("");
  }
}

function cartItemTemplate(item) {
  const totalPrice = (item.FinalPrice || 0) * (item.quantity || 1);
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.NameWithoutBrand}</h2>
    </a>
    <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
    <p class="cart-card__quantity">qty: ${item.quantity || 1}</p>
    <p class="cart-card__price">Total: $${totalPrice.toFixed(2)}</p>
  </li>`;
}


renderCartContents();
