import { productData } from "./product.js";

const productDom = document.querySelector(".main-page");
const cartItems = document.querySelector(".cart-number");
const cartTotal = document.querySelector(".total-price");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];
// GET PRODUCT
class Products {
  // get element from api end point
  getproduct() {
    return productData;
  }
}
// DISPLAY PRODUCT
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += ` <div class="box">
<div class="box-img">
  <img
    class="photo-size"
    src=${item.imageUrl}
    alt=""
  />
</div>
<div class="main-text">
<p class="product-name">${item.title}</p>
  <span id="price">${item.price}  $</span>
</div>
<div class="footer-btn">
  <button class="btn add-to-cart" type="button" data-id=${item.id}>add to card</button>
</div>
</div>`;
      productDom.innerHTML = result;
    });
  }
  getAddTOCartBtns() {
    const addTocartBtn = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addTocartBtn;

    addTocartBtn.forEach((btn) => {
      const id = btn.dataset.id;
      // isincart is boolean arg
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        const addedProduct = { ...Storage.getproduct(id), quantity: 1 };
        // console.log(addedProduct);
        // add to cart
        cart = [...cart, addedProduct];
        // save cart to local storage
        Storage.saveCart(cart);
        // update cart value
        this.setCartValue(cart);
        // add to cart item
        this.addCartItem(addedProduct);
        // get cart from storage !
      });
    });
  }
  setCartValue(cart) {
    // 1. cart item:
    // 2.cart total price:
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `           
     <img src=${cartItem.imageUrl} alt="">
    <div class="sp-text">
      <p>${cartItem.title}</p>
      <p>${cartItem.price}</p>
    </div>
    <div class="sp-modal">
      <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
      <span>${cartItem.quantity}</span>
      <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
    </div>
    <i class="fas fa-trash-alt " data-id=${cartItem.id}></i>`;
    cartContent.appendChild(div);
  }
  setupApp() {
    // get cart from storage
    cart = Storage.getCart() || []; // mean: if left side is null read the right side( or )
    // addCartItem
    cart.forEach((cartItem) => {
      this.addCartItem(cartItem);
    });
    // set value : total price + item
    this.setCartValue(cart);
  }
  cartLogic() {
    // clear all selected product cart button
    clearCart.addEventListener("click", () => {
      // remove
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        const addQuantity = event.target;
        //  get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        // update cart value
        this.setCartValue(cart);
        // save cart
        Storage.saveCart(cart);
        // update cart number in UI
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
        // remove from cartItem
        // remove
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const substractedItem = cart.find(
          (c) => c.id == subQuantity.dataset.id
        );
        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
    //
  }
  clearCart() {
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // update total price and cart items
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);
    // get add to cart buttons => update text and disable
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDOM.find((btn) => btn.dataset.id == parseInt(id));
    button.innerText = "add to cart";
    button.disabled = false;
  }
}
// LOCAL STORAGE
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getproduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // set up: get cart and set up app
  const products = new Products();
  const productsData = products.getproduct();
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddTOCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});

//  NAV SHOP

const navMenu = document.querySelector(".fa-bars");
const activeBar = document.querySelector(".active-bar");
const active = document.querySelector(".nav-item");
const body = document.querySelector(".main-page");

navMenu.addEventListener("click", () => {
  body.style.opacity = ".5";
  active.style.width = "18%";
  active.style.height = "400px";
});

activeBar.addEventListener("click", () => {
  body.style.opacity = "1";
  active.style.width = "0";
  active.style.height = "0";
});

// MODAL CART

const shopCard = document.querySelector(".shop-cart");
const boxShop = document.querySelector(".cart-bill");
const backdrop = document.querySelector(".backdrop");

shopCard.addEventListener("click", () => {
  boxShop.style.transform = "translateY(10%)";
  boxShop.style.top = "10%";
  body.style.opacity = ".5";
});

backdrop.addEventListener("click", () => {
  boxShop.style.transform = "translateY(-240%)";
  body.style.opacity = "1";
});
