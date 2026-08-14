const products=[
{id:1,name:"Turmeric Powder",cat:"Spices",price:120,emoji:"🟡"},
{id:2,name:"Red Chilli Powder",cat:"Spices",price:180,emoji:"🌶️"},
{id:3,name:"Coriander Powder",cat:"Spices",price:140,emoji:"🌿"},
{id:4,name:"Garam Masala",cat:"Spices",price:260,emoji:"🫙"},
{id:5,name:"Wheat Flour",cat:"Flour",price:55,emoji:"🌾"},
{id:6,name:"Premium Rice",cat:"Rice",price:70,emoji:"🍚"}];
let cart=JSON.parse(localStorage.getItem("sp_cart")||"[]"),orders=JSON.parse(localStorage.getItem("sp_orders")||"[]"),cat="All";
const money=n=>"₹"+n.toLocaleString("en-IN");
function setCat(c,b){cat=c;document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts()}
function renderProducts(){let q=document.getElementById("search").value.toLowerCase();let list=products.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(q));document.getElementById("productGrid").innerHTML=list.map(p=>`<article class="product"><div class="pic">${p.emoji}</div><div class="cat">${p.cat}</div><h3>${p.name}</h3><div class="price">${money(p.price)} <small>/ kg</small></div><button class="add" onclick="add(${p.id})">Add to Cart</button></article>`).join("")}
function save(){localStorage.setItem("sp_cart",JSON.stringify(cart));localStorage.setItem("sp_orders",JSON.stringify(orders))}
function add(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();openCart()}
function change(id,d){let x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function renderCart(){document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);let box=document.getElementById("cartItems");if(!cart.length){box.innerHTML="<p class='muted'>Your cart is empty.</p>";document.getElementById("cartTotal").textContent="₹0";return}let total=0;box.innerHTML=cart.map(x=>{let p=products.find(y=>y.id===x.id),sum=p.price*x.qty;total+=sum;return `<div class="cartItem"><div class="thumb">${p.emoji}</div><div><b>${p.name}</b><div class="qty"><button onclick="change(${p.id},-1)">−</button><span>${x.qty}</span><button onclick="change(${p.id},1)">+</button></div></div><b>${money(sum)}</b></div>`}).join("");document.getElementById("cartTotal").textContent=money(total)}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("open");renderCart()}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("overlay").classList.remove("open")}
function placeOrder(){if(!cart.length)return alert("Please add products to cart.");let name=document.getElementById("name").value.trim(),phone=document.getElementById("phone").value.trim(),address=document.getElementById("address").value.trim(),payment=document.getElementById("payment").value;if(!name||!phone||!address)return alert("Please fill name, mobile and delivery address.");let total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);let id="SP"+Date.now().toString().slice(-8);orders.unshift({id,date:new Date().toLocaleString("en-IN"),name,phone,address,payment,total,items:cart.map(x=>({id:x.id,qty:x.qty}))});cart=[];save();renderCart();renderOrders();closeCart();document.getElementById("orders").scrollIntoView({behavior:"smooth"});alert("Order placed successfully! Order ID: "+id)}
function renderOrders(){let b=document.getElementById("ordersBox");if(!orders.length){b.textContent="No orders yet.";return}b.innerHTML=orders.map(o=>`<div class="order"><b>Order #${o.id}</b><br><small>${o.date}</small><br>${o.items.map(x=>{let p=products.find(y=>y.id===x.id);return `${p.name} × ${x.qty}`}).join(", ")}<br><strong>${money(o.total)}</strong> • ${o.payment}</div>`).join("")}
renderProducts();renderCart();renderOrders();
