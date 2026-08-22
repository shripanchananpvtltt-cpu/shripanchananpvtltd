const products = [
  {id:1,name:"Turmeric Powder",cat:"Spices",price:120,emoji:"🟡",image:"turmeric-powder.png"},
  {id:2,name:"Red Chilli Powder",cat:"Spices",price:180,emoji:"🌶️",image:"red-chilli-powder.png"},
  {id:3,name:"Coriander Powder",cat:"Spices",price:140,emoji:"🌿",image:"coriander-powder.png"},
  {id:4,name:"Garam Masala",cat:"Spices",price:260,emoji:"🫙",image:"garam-masala.png"},
  {id:5,name:"Wheat Flour",cat:"Flour",price:55,emoji:"🌾",image:"wheat-flour.png"},
  {id:6,name:"Premium Rice",cat:"Rice",price:70,emoji:"🍚",image:"premium-rice.png"}
];

const WHATSAPP_NUMBER = "917756039746";
const DELIVERY_CHARGE_PER_KM = 30;
Delivery Distance:
${Number(order.distanceKm).toFixed(1)} km

Delivery Charge:
${money(order.delivery)}
// Shri Panchanan Pvt Ltd delivery starting point
// Bhanjanagara, Badakodonda, Thakurani Sahi
const SHOP_LAT = 19.9277;
const SHOP_LON = 84.5828;

let deliveryDistanceKm = 0;
let deliveryCharge = 0;
let deliveryCalculated = false;

function getDeliveryCharge() {
  return deliveryCalculated
    ? deliveryCharge
    : 0;
}

function getGrandTotal() {
  return getCartSubtotal() + getDeliveryCharge();
}

fDELIVERY_CHARGEunction getGrandTotal() {
  const subtotal = cart.reduce(
    (total, item) => total + (Number(item.price) * Number(item.qty)),
    0
  );

  return subtotal + getDeliveryCharge();
}

let cart = JSON.parse(localStorage.getItem("sp_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("sp_orders") || "[]");
let cat = "All";

const money = n => "₹" + Number(n).toLocaleString("en-IN");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  })[c]);
}

function save() {
  localStorage.setItem("sp_cart", JSON.stringify(cart));
  localStorage.setItem("sp_orders", JSON.stringify(orders));
}

function setCat(c, btn) {
  cat = c;

  document.querySelectorAll(".chips button")
    .forEach(b => b.classList.remove("active"));

  if (btn) btn.classList.add("active");

  renderProducts();
}

function productImage(p, cls = "productImg") {
  return `
    <img
      class="${cls}"
      src="${p.image}"
      alt="${escapeHtml(p.name)}"
      loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
    >
    <span class="imageFallback" style="display:none">${p.emoji}</span>
  `;
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

      <div class="cat">${escapeHtml(p.cat)}</div>

      <h3>${escapeHtml(p.name)}</h3>

      <div class="price">
        ${money(p.price)} <small>/ kg</small>
      </div>

      <button class="add" onclick="add(${p.id})">
        🛒 Add to Cart
      </button>
    </article>
  `).join("");
}

function add(id) {
  const item = cart.find(x => x.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id:id,
      qty:1
    });
  }

  save();
  renderCart();
  openCart();
}

function change(id, amount) {
  const item = cart.find(x => x.id === id);

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(x => x.id !== id);
  }

  save();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(x => x.id !== id);

  save();
  renderCart();
}

function getCartSubtotal() {
  return cart.reduce((total, item) => {
    const p = products.find(x => x.id === item.id);

    if (!p) return total;

    return total + (p.price * item.qty);
  }, 0);
}

function renderCart() {
  const count = document.getElementById("cartCount");
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("cartTotal");

  if (!count || !box || !totalBox) return;

  const quantity = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  count.textContent = quantity;

  if (!cart.length) {
    box.innerHTML = `
      <div class="emptyCart">
        <div style="font-size:45px">🛒</div>
        <p class="muted">Your cart is empty.</p>
      </div>
    `;

    totalBox.textContent = "₹0";
    return;
  }

  let subtotal = 0;

  box.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);

    if (!p) return "";

    const amount = p.price * item.qty;
    subtotal += amount;

    return `
      <div class="cartItem">

        <div class="thumb">
          ${productImage(p,"cartImg")}
        </div>

        <div class="cartInfo">

          <b>${escapeHtml(p.name)}</b>

          <span>
            ${money(p.price)} / kg
          </span>

          <div class="qty">
            <button onclick="change(${p.id},-1)">−</button>

            <strong>${item.qty}</strong>

            <button onclick="change(${p.id},1)">+</button>
          </div>

          <button
            class="remove"
            onclick="removeItem(${p.id})">
            Remove
          </button>

        </div>

        <strong class="itemTotal">
          ${money(amount)}
        </strong>

      </div>
    `;
  }).join("");

  const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;
  const grandTotal = subtotal + delivery;

  totalBox.innerHTML = `
    <div style="display:flex;justify-content:space-between">
      <span>Subtotal</span>
      <b>${money(subtotal)}</b>
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:6px">
      <span>Delivery</span>
      <b>${delivery === 0 ? "FREE" : money(delivery)}</b>
    </div>

    <div style="
      display:flex;
      justify-content:space-between;
      margin-top:10px;
      padding-top:10px;
      border-top:1px solid #ddd;
      font-size:18px;
    ">
      <span>Grand Total</span>
      <b>${money(grandTotal)}</b>
    </div>
  `;
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

function validPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function createOrder() {
  const nameEl = document.getElementById("name");
  const phoneEl = document.getElementById("phone");
  const addressEl = document.getElementById("address");
  const paymentEl = document.getElementById("payment");

  if (!nameEl || !phoneEl || !addressEl) {
    alert("Checkout form not found.");
    return null;
  }

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const address = addressEl.value.trim();

  if (!name) {
    alert("Please enter your full name.");
    nameEl.focus();
    return null;
  }

  if (!validPhone(phone)) {
    alert("Please enter a valid 10-digit Indian mobile number.");
    phoneEl.focus();
    return null;
  }

  if (address.length < 10) {
    alert("Please enter your complete delivery address.");
    addressEl.focus();
    return null;
  }

  const items = cart.map(item => {
    const p = products.find(x => x.id === item.id);

    if (!p) return null;

    return {
      id:p.id,
      name:p.name,
      qty:item.qty,
      price:p.price,
      amount:p.price * item.qty
    };
  }).filter(Boolean);

  if (!items.length) {
    alert("Your cart is empty.");
    return null;
  }

  const subtotal = items.reduce(
    (sum,item) => sum + item.amount,
    0
  );

  const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;

  return {
    id:"SP" + Date.now(),
    date:new Date().toLocaleString("en-IN"),
    customer:{
      name:name,
      phone:phone,
      address:address
    },
    payment:paymentEl
      ? paymentEl.value
      : "Cash on Delivery",
    items:items,
    subtotal:subtotal,
    delivery:delivery,
    total:subtotal + delivery,
    status:"Order Received"
  };
}

function createWhatsAppMessage(order) {

  let message =
`*SHRI PANCHANAN PVT LTD*
━━━━━━━━━━━━━━━━━━

*New Order* 🛒

*Order ID:* ${order.id}
*Date:* ${order.date}

*Customer Details*
Name: ${order.customer.name}
Mobile: ${order.customer.phone}
Address: ${order.customer.address}

*Products*
`;

  order.items.forEach((item,index) => {
    message +=
`${index + 1}. ${item.name}
   Qty: ${item.qty} kg
   Price: ${money(item.price)}/kg
   Amount: ${money(item.amount)}

`;
  });

  message +=
`━━━━━━━━━━━━━━━━━━
Subtotal: ${money(order.subtotal)}
Delivery: ${order.delivery === 0 ? "FREE" : money(order.delivery)}
*Grand Total: ${money(order.total)}*

Payment: ${order.payment}

Please confirm my order.

Thank you.
Shri Panchanan Pvt Ltd`;

  return message;
}

function sendWhatsApp(order) {
  const message = createWhatsAppMessage(order);

  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

function placeOrder() {

  const order = createOrder();

  if (!order) return;

  const confirmOrder = confirm(
    "Order Total: " +
    money(order.total) +
    "\n\n" +
    "Press OK to send this order to WhatsApp."
  );

  if (!confirmOrder) return;

  orders.unshift(order);

  cart = [];

  save();

  renderCart();
  renderOrders();

  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");

  if (name) name.value = "";
  if (phone) phone.value = "";
  if (address) address.value = "";

  closeCart();

  sendWhatsApp(order);
}

function renderOrders() {

  const box = document.getElementById("ordersBox");

  if (!box) return;

  if (!orders.length) {
    box.innerHTML = `
      <p class="muted">No orders yet.</p>
    `;
    return;
  }

  box.innerHTML = orders.map(order => {

    const items = (order.items || []).map(item => `
      <div style="margin:5px 0">
        ${escapeHtml(item.name)}
        × ${Number(item.qty)}
        = ${money(item.amount)}
      </div>
    `).join("");

    return `
      <div class="orderCard">

        <h3>
          Order #${escapeHtml(order.id)}
        </h3>

        <p>
          <b>Date:</b>
          ${escapeHtml(order.date)}
        </p>

        <p>
          <b>Name:</b>
          ${escapeHtml(order.customer.name)}
        </p>

        <p>
          <b>Phone:</b>
          ${escapeHtml(order.customer.phone)}
        </p>
const subtotal = cart.reduce(
  (total, item) => total + (Number(item.price) * Number(item.qty)),
  0
);

const delivery = cart.length > 0 ? 30 : 0;
const grandTotal = subtotal + delivery;

summary.innerHTML = `
  <div class="summary-row">
    <span>Subtotal</span>
    <strong>₹${subtotal}</strong>
  </div>

  <div class="summary-row">
    <span>Delivery Charge</span>
    <strong>₹${delivery}</strong>
  </div>

  <div class="summary-row total">
    <span>Grand Total</span>
    <strong>₹${grandTotal}</strong>
  </div>
`;
        <p>
          <b>Status:</b>
          ${escapeHtml(order.status)}
        </p>

        <p>
          <b>Payment:</b>
          ${escapeHtml(order.payment)}
        </p>

        <div>
          <b>Items:</b>
          ${items}
        </div>

        <hr>

        <p>

      </div>
    `;
  }).join("");
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
async function calculateDelivery() {

  const addressEl = document.getElementById("address");
  const statusEl = document.getElementById("deliveryStatus");

  if (!addressEl || !statusEl) return;

  const address = addressEl.value.trim();

  if (address.length < 10) {
    statusEl.innerHTML =
      "❌ Please enter your complete delivery address.";

    deliveryCalculated = false;
    deliveryDistanceKm = 0;
    deliveryCharge = 0;

    renderCart();
    return;
  }

  statusEl.innerHTML =
    "⏳ Calculating delivery distance...";

  try {

    // Address → coordinates
    const geocodeUrl =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        format: "jsonv2",
        limit: "1",
        countrycodes: "in",
        q: address
      });

    const geoResponse =
      await fetch(geocodeUrl);

    if (!geoResponse.ok) {
      throw new Error("Geocoding failed");
    }

    const geoData =
      await geoResponse.json();

    if (!geoData.length) {
      throw new Error(
        "Address could not be found"
      );
    }

    const customerLat =
      Number(geoData[0].lat);

    const customerLon =
      Number(geoData[0].lon);

    // Shop → Customer driving route
    const routeUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${SHOP_LON},${SHOP_LAT};` +
      `${customerLon},${customerLat}` +
      `?overview=false`;

    const routeResponse =
      await fetch(routeUrl);

    if (!routeResponse.ok) {
      throw new Error("Routing failed");
    }

    const routeData =
      await routeResponse.json();

    if (
      routeData.code !== "Ok" ||
      !routeData.routes ||
      !routeData.routes.length
    ) {
      throw new Error(
        "Driving route not found"
      );
    }

    // OSRM gives meters
    const meters =
      Number(routeData.routes[0].distance);

    // Convert to KM
    const km =
      meters / 1000;

    // Round to 1 decimal
    deliveryDistanceKm =
      Math.ceil(km * 10) / 10;

    deliveryCharge =
      Math.ceil(
        deliveryDistanceKm *
        DELIVERY_CHARGE_PER_KM
      );

    deliveryCalculated = true;

    statusEl.innerHTML = `
      <div>
        📍 Delivery distance:
        <strong>${deliveryDistanceKm.toFixed(1)} km</strong>
      </div>

      <div style="margin-top:5px">
        🚚 Delivery charge:
        <strong>${money(deliveryCharge)}</strong>
      </div>

      <div style="margin-top:5px;font-size:12px">
        ₹${DELIVERY_CHARGE_PER_KM}/km
      </div>

      <div style="
        margin-top:8px;
        font-size:11px;
        color:#777;
      ">
        Distance calculated using OpenStreetMap routing.
      </div>
    `;

    renderCart();

  } catch (error) {

    console.error(error);

    deliveryCalculated = false;
    deliveryDistanceKm = 0;
    deliveryCharge = 0;

    statusEl.innerHTML =
      "❌ Delivery distance could not be calculated. " +
      "Please check the address and try again.";

    renderCart();
  }
}
const delivery =
  cart.length > 0 && deliveryCalculated
    ? deliveryCharge
    : 0;

const grandTotal =
  subtotal + delivery;
<span>
  Delivery
  ${
    deliveryCalculated
      ? `(${deliveryDistanceKm.toFixed(1)} km × ₹30)`
      : ""
  }
</span>
if (!deliveryCalculated) {
  alert(
    "Please calculate the delivery charge before placing your order."
  );

  calculateDelivery();
  return null;
}

const delivery = deliveryCharge;
distanceKm: deliveryDistanceKm,
deliveryPerKm: DELIVERY_CHARGE_PER_KM,
delivery: delivery,
total: subtotal + delivery,
  
