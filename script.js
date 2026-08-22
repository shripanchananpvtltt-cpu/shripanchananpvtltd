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

/*
  Shop location used for delivery-distance calculation.
  The address is geocoded automatically, so no guessed latitude/longitude
  is hard-coded here.
*/
const SHOP_ADDRESS =
  "Bhanjanagara, Badakodonda, Thakurani Sahi, Sethi House, 1st Floor, Odisha, India";

let cart = JSON.parse(localStorage.getItem("sp_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("sp_orders") || "[]");
let cat = "All";

let deliveryDistanceKm = 0;
let deliveryCharge = 0;
let deliveryCalculated = false;

const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");

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
  document.querySelectorAll(".chips button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderProducts();
}

function productImage(p, cls = "productImg") {
  return `
    <img class="${cls}" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
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
      <div class="price">${money(p.price)} <small>/ kg</small></div>
      <button class="add" onclick="add(${p.id})">🛒 Add to Cart</button>
    </article>
  `).join("");
}

function resetDelivery() {
  deliveryCalculated = false;
  deliveryDistanceKm = 0;
  deliveryCharge = 0;
}

function add(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({id, qty:1});
  resetDelivery();
  save();
  renderCart();
  openCart();
}

function change(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);

  resetDelivery();
  save();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(x => x.id !== id);
  resetDelivery();
  save();
  renderCart();
}

function getCartSubtotal() {
  return cart.reduce((total, item) => {
    const p = products.find(x => x.id === item.id);
    return p ? total + p.price * item.qty : total;
  }, 0);
}

function renderCart() {
  const count = document.getElementById("cartCount");
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("cartTotal");
  if (!count || !box || !totalBox) return;

  count.textContent = cart.reduce((sum, item) => sum + Number(item.qty), 0);

  if (!cart.length) {
    box.innerHTML = `<div class="emptyCart"><div style="font-size:45px">🛒</div><p class="muted">Your cart is empty.</p></div>`;
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
        <div class="thumb">${productImage(p,"cartImg")}</div>
        <div class="cartInfo">
          <b>${escapeHtml(p.name)}</b>
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

  const delivery = deliveryCalculated ? deliveryCharge : 0;
  const grandTotal = subtotal + delivery;

  totalBox.innerHTML = `
    <div style="display:flex;justify-content:space-between">
      <span>Subtotal</span><b>${money(subtotal)}</b>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:6px">
      <span>Delivery ${
        deliveryCalculated
          ? `(${deliveryDistanceKm.toFixed(1)} km × ₹${DELIVERY_CHARGE_PER_KM})`
          : ""
      }</span>
      <b>${deliveryCalculated ? money(delivery) : "Calculate"}</b>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid #ddd;font-size:18px">
      <span>Grand Total</span><b>${money(grandTotal)}</b>
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

/*
  Nominatim is used only after the customer presses the button.
  This avoids geocoding on every keystroke.
*/
async function geocodeAddress(address) {
  const url = "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      format: "jsonv2",
      limit: "1",
      countrycodes: "in",
      q: address
    });

  const response = await fetch(url, {
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) throw new Error("Geocoding failed");

  const data = await response.json();
  if (!data.length) throw new Error("Address not found");

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    displayName: data[0].display_name || address
  };
}

async function calculateDelivery() {
  const addressEl = document.getElementById("address");
  const statusEl = document.getElementById("deliveryStatus");

  if (!addressEl || !statusEl) return;

  if (!cart.length) {
    statusEl.innerHTML = "🛒 Please add products to your cart first.";
    return;
  }

  const address = addressEl.value.trim();

  if (address.length < 10) {
    resetDelivery();
    statusEl.innerHTML = "❌ Please enter your complete delivery address.";
    renderCart();
    return;
  }

  statusEl.innerHTML = "⏳ Finding shop location...";

  try {
    const shop = await geocodeAddress(SHOP_ADDRESS);

    statusEl.innerHTML = "⏳ Finding customer address...";

    const customer = await geocodeAddress(address + ", Odisha, India");

    statusEl.innerHTML = "⏳ Calculating driving distance...";

    const routeUrl =
      "https://router.project-osrm.org/route/v1/driving/" +
      `${shop.lon},${shop.lat};${customer.lon},${customer.lat}` +
      "?overview=false";

    const routeResponse = await fetch(routeUrl);

    if (!routeResponse.ok) {
      throw new Error("Routing request failed");
    }

    const routeData = await routeResponse.json();

    if (routeData.code !== "Ok" || !routeData.routes?.length) {
      throw new Error("Driving route not found");
    }

    const meters = Number(routeData.routes[0].distance);
    const rawKm = meters / 1000;

    deliveryDistanceKm = Math.ceil(rawKm * 10) / 10;
    deliveryCharge = Math.ceil(
      deliveryDistanceKm * DELIVERY_CHARGE_PER_KM
    );
    deliveryCalculated = true;

    statusEl.innerHTML = `
      <div>📍 Delivery distance: <strong>${deliveryDistanceKm.toFixed(1)} km</strong></div>
      <div style="margin-top:5px">🚚 Delivery charge: <strong>${money(deliveryCharge)}</strong></div>
      <div style="margin-top:5px;font-size:12px">₹${DELIVERY_CHARGE_PER_KM} per km</div>
      <div style="margin-top:8px;font-size:11px;color:#777">
        Distance calculated using OpenStreetMap / OSRM.
      </div>
    `;

    renderCart();

  } catch (error) {
    console.error(error);
    resetDelivery();
    statusEl.innerHTML =
      "❌ Could not calculate delivery distance. Please check the address and try again.";
    renderCart();
  }
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

  if (!cart.length) {
    alert("Your cart is empty.");
    return null;
  }

  if (!deliveryCalculated) {
    alert("Please calculate the delivery charge first.");
    return null;
  }

  const items = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      qty: Number(item.qty),
      price: Number(p.price),
      amount: Number(p.price) * Number(item.qty)
    };
  }).filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    id: "SP" + Date.now(),
    date: new Date().toLocaleString("en-IN"),
    customer: {name, phone, address},
    payment: paymentEl ? paymentEl.value : "Cash on Delivery",
    items,
    subtotal,
    distanceKm: deliveryDistanceKm,
    deliveryPerKm: DELIVERY_CHARGE_PER_KM,
    delivery: deliveryCharge,
    total: subtotal + deliveryCharge,
    status: "Order Received"
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
    message += `${index + 1}. ${item.name}
   Qty: ${item.qty} kg
   Price: ${money(item.price)}/kg
   Amount: ${money(item.amount)}

`;
  });

  message +=
`━━━━━━━━━━━━━━━━━━
Subtotal: ${money(order.subtotal)}
Delivery Distance: ${Number(order.distanceKm).toFixed(1)} km
Delivery Charge: ${money(order.delivery)}
*Grand Total: ${money(order.total)}*

Payment: ${order.payment}

Please confirm my order.

Thank you.
Shri Panchanan Pvt Ltd`;

  return message;
}

function sendWhatsApp(order) {
  const url =
    "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(createWhatsAppMessage(order));

  window.open(url, "_blank");
}

function placeOrder() {
  const order = createOrder();
  if (!order) return;

  const confirmOrder = confirm(
    "Delivery Distance: " + Number(order.distanceKm).toFixed(1) + " km\n\n" +
    "Delivery Charge: " + money(order.delivery) + "\n\n" +
    "Grand Total: " + money(order.total) + "\n\n" +
    "Press OK to send this order to WhatsApp."
  );

  if (!confirmOrder) return;

  orders.unshift(order);
  cart = [];
  resetDelivery();
  save();
  renderCart();
  renderOrders();

  ["name","phone","address"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const status = document.getElementById("deliveryStatus");
  if (status) status.textContent = "Enter your complete delivery address.";

  closeCart();
  sendWhatsApp(order);
}

function renderOrders() {
  const box = document.getElementById("ordersBox");
  if (!box) return;

  if (!orders.length) {
    box.innerHTML = `<p class="muted">No orders yet.</p>`;
    return;
  }

  box.innerHTML = orders.map(order => {
    const items = (order.items || []).map(item => `
      <div style="margin:5px 0">
        ${escapeHtml(item.name)} × ${Number(item.qty)} = ${money(item.amount)}
      </div>
    `).join("");

    const distance = Number(order.distanceKm || 0);

    return `
      <div class="orderCard">
        <h3>Order #${escapeHtml(order.id)}</h3>
        <p><b>Date:</b> ${escapeHtml(order.date)}</p>
        <p><b>Name:</b> ${escapeHtml(order.customer.name)}</p>
        <p><b>Phone:</b> ${escapeHtml(order.customer.phone)}</p>
        <p><b>Address:</b> ${escapeHtml(order.customer.address)}</p>
        <p><b>Status:</b> ${escapeHtml(order.status)}</p>
        <p><b>Payment:</b> ${escapeHtml(order.payment)}</p>
        <div><b>Items:</b>${items}</div>
        <hr>
        <p><b>Subtotal:</b> ${money(order.subtotal)}</p>
        <p><b>Distance:</b> ${distance ? distance.toFixed(1) + " km" : "Not available"}</p>
        <p><b>Delivery:</b> ${money(order.delivery)}</p>
        <p style="font-size:18px"><b>Grand Total:</b> <strong>${money(order.total)}</strong></p>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");
  if (search) search.addEventListener("input", renderProducts);
  renderProducts();
  renderCart();
  renderOrders();
});
