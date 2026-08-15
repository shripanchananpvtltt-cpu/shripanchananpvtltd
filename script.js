const products = [
  {id:1,name:"Turmeric Powder",cat:"Spices",price:120,emoji:"🟡",image:"turmeric-powder.png"},
  {id:2,name:"Red Chilli Powder",cat:"Spices",price:180,emoji:"🌶️",image:"red-chilli-powder.png"},
  {id:3,name:"Coriander Powder",cat:"Spices",price:140,emoji:"🌿",image:"coriander-powder.png"},
  {id:4,name:"Garam Masala",cat:"Spices",price:260,emoji:"🫙",image:"garam-masala.png"},
  {id:5,name:"Wheat Flour",cat:"Flour",price:55,emoji:"🌾",image:"wheat-flour.png"},
  {id:6,name:"Premium Rice",cat:"Rice",price:70,emoji:"🍚",image:"premium-rice.png"}
];

let cart = JSON.parse(localStorage.getItem("sp_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("sp_orders") || "[]");
let cat = "All";

const money = n => "₹" + Number(n).toLocaleString("en-IN");

// Escape user-provided strings before inserting into innerHTML to avoid XSS
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

function setCat(c, btn) {
  cat = c;
  document.querySelectorAll(".chips button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderProducts();
}

function productImage(p, cls = "productImg") {
  return `<img class="${cls}" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="imageFallback" style="display:none">${p.emoji}</span>`;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const search = document.getElementById("search");
  const q = search ? search.value.toLowerCase().trim() : "";

  const list = products.filter(p =>
    (cat === "All" || p.cat === cat) &&
    p.name.toLowerCase().includes(q)
  );

  if (!list.length) {
    grid.innerHTML = `<div class="muted">No products found.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product">
      <div class="pic">${productImage(p)}</div>
      <div class="cat">${p.cat}</div>
      <h3>${p.name}</h3>
      <div class="price">${money(p.price)} <small>/ kg</small></div>
      <button class="add" onclick="add(${p.id})">Add to Cart</button>
    </article>
  `).join("");
}

function save() {
  localStorage.setItem("sp_cart", JSON.stringify(cart));
  localStorage.setItem("sp_orders", JSON.stringify(orders));
}

function add(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({id:id, qty:1});
  save();
  renderCart();
  openCart();
}

function change(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);

  save();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(x => x.id !== id);
  save();
  renderCart();
}

function renderCart() {
  const count = document.getElementById("cartCount");
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("cartTotal");

  if (!count || !box || !totalBox) return;

  count.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  if (!cart.length) {
    box.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    totalBox.textContent = "₹0";
    return;
  }

  let total = 0;

  box.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return "";

    const amount = p.price * item.qty;
    total += amount;

    return `
      <div class="cartItem">
        <div class="thumb">${productImage(p, "cartImg")}</div>

        <div class="cartInfo">
          <b>${p.name}</b>
          <span>${money(p.price)} / kg</span>

          <div class="qty">
            <button onclick="change(${p.id},-1)">−</button>
            <strong>${item.qty}</strong>
            <button onclick="change(${p.id},1)">+</button>
          </div>

          <button class="remove" onclick="removeItem(${p.id})">Remove</button>
        </div>

        <strong class="itemTotal">${money(amount)}</strong>
      </div>
    `;
  }).join("");

  totalBox.textContent = money(total);
}

function openCart() {
  const cartBox = document.getElementById("cart");
  const overlay = document.getElementById("overlay");

  if (cartBox) cartBox.classList.add("open");
  if (overlay) overlay.classList.add("show");

  renderCart();
}

function closeCart() {
  const cartBox = document.getElementById("cart");
  const overlay = document.getElementById("overlay");

  if (cartBox) cartBox.classList.remove("open");
  if (overlay) overlay.classList.remove("show");
}

function placeOrder() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");
  const payment = document.getElementById("payment");

  if (!name || !phone || !address) {
    alert("Checkout form not found.");
    return;
  }

  if (!name.value.trim()) {
    alert("Please enter your name.");
    return;
  }

  if (!phone.value.trim()) {
    alert("Please enter your mobile number.");
    return;
  }

  if (!address.value.trim()) {
    alert("Please enter your address.");
    return;
  }

  let total = 0;

  const items = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return null;

    const amount = p.price * item.qty;
    total += amount;

    return {
      id:p.id,
      name:p.name,
      qty:item.qty,
      price:p.price,
      amount:amount
    };
  }).filter(Boolean);

  const order = {
    id:"SP" + Date.now(),
    date:new Date().toLocaleString("en-IN"),
    customer:{
      name:name.value.trim(),
      phone:phone.value.trim(),
      address:address.value.trim()
    },
    payment:payment ? payment.value : "COD",
    items:items,
    total:total,
    status:"Order Received"
  };

  orders.unshift(order);
  cart = [];

  save();
  renderCart();
  renderOrders();

  name.value = "";
  phone.value = "";
  address.value = "";

  alert("Order placed successfully!\n\nOrder ID: " + order.id);
  closeCart();
}

function renderOrders() {
  const box = document.getElementById("ordersBox");
  if (!box) return;

  if (!orders.length) {
    box.innerHTML = `<p class="muted">No orders yet.</p>`;
    return;
  }

  box.innerHTML = orders.map(order => `
    <div class="orderCard">
      <h3>Order #${escapeHtml(order.id)}</h3>
      <p><b>Date:</b> ${escapeHtml(order.date)}</p>
      <p><b>Name:</b> ${escapeHtml(order.customer.name)}</p>
      <p><b>Phone:</b> ${escapeHtml(order.customer.phone)}</p>
      <p><b>Status:</b> ${escapeHtml(order.status)}</p>
      <p><b>Payment:</b> ${escapeHtml(order.payment)}</p>

      ${order.items.map(item => `
        <div>
          ${escapeHtml(item.name)} × ${item.qty} = ${money(item.amount)}
        </div>
      `).join("")}

      <br>
      <strong>Total: ${money(order.total)}</strong>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");

  if (search) {
    search.addEventListener("input", renderProducts);
  }

  renderProducts();
  renderCart();
  renderOrders();
});
