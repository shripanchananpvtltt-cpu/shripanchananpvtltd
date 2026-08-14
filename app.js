const products=[
{id:1,name:"Turmeric Powder",cat:"Spices",price:120,unit:"/kg",icon:"🌿"},
{id:2,name:"Red Chilli Powder",cat:"Spices",price:180,unit:"/kg",icon:"🌶️"},
{id:3,name:"Coriander Powder",cat:"Spices",price:140,unit:"/kg",icon:"🌱"},
{id:4,name:"Garam Masala",cat:"Spices",price:260,unit:"/kg",icon:"🫚"},
{id:5,name:"Wheat Flour",cat:"Flour",price:55,unit:"/kg",icon:"🌾"},
{id:6,name:"Premium Rice",cat:"Rice",price:70,unit:"/kg",icon:"🍚"}
];
let cart=JSON.parse(localStorage.getItem("sp_cart")||"[]"), activeCat="All";

const $=s=>document.querySelector(s);
const money=n=>"₹"+n.toLocaleString("en-IN");
function save(){localStorage.setItem("sp_cart",JSON.stringify(cart));renderCart();updateCount()}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function updateCount(){$("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0)}
function renderProducts(){
 const q=$("#search").value.toLowerCase();
 const list=products.filter(p=>(activeCat==="All"||p.cat===activeCat)&&p.name.toLowerCase().includes(q));
 $("#productGrid").innerHTML=list.map(p=>`<article class="product"><div class="pic">${p.icon}</div><h3>${p.name}</h3><p>${p.cat} • ${p.unit}</p><div class="price">${money(p.price)}<small>${p.unit}</small></div><button class="add" onclick="add(${p.id})">Add to Cart</button></article>`).join("")||'<div class="empty">No products found.</div>';
}
function add(id){const item=cart.find(x=>x.id===id);item?item.qty++:cart.push({id,qty:1});save();toast("Added to cart")}
function change(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save()}
function renderCart(){
 const box=$("#cartItems");
 if(!cart.length){box.innerHTML='<div class="empty">Your cart is empty. Add products to continue.</div>';$("#checkout").style.display="none";$("#cartTotal").textContent="₹0";return}
 $("#checkout").style.display="grid";
 let total=0;
 box.innerHTML=cart.map(x=>{const p=products.find(y=>y.id===x.id), sub=p.price*x.qty;total+=sub;return `<div class="cart-row"><div class="grow"><b>${p.name}</b><br><small>${money(p.price)} × ${x.qty}</small></div><div class="qty"><button onclick="change(${p.id},-1)">−</button> <b>${x.qty}</b> <button onclick="change(${p.id},1)">+</button></div><b>${money(sub)}</b></div>`}).join("");
 $("#cartTotal").textContent=money(total)
}
function openCart(){renderCart();$("#cartModal").classList.add("show")}
function closeCart(){$("#cartModal").classList.remove("show")}
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}

$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;
$("#cartModal").addEventListener("click",e=>{if(e.target.id==="cartModal")closeCart()});
$("#search").addEventListener("input",renderProducts);
$("#chips").addEventListener("click",e=>{if(e.target.dataset.cat){activeCat=e.target.dataset.cat;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===e.target));renderProducts()}});
$("#menuBtn").onclick=()=>{$("#drawer").classList.add("open");$("#scrim").classList.add("show")};
$("#closeMenu").onclick=$("#scrim").onclick=()=>{$("#drawer").classList.remove("open");$("#scrim").classList.remove("show")};
document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>{scrollToId(b.dataset.scroll);$("#drawer").classList.remove("open");$("#scrim").classList.remove("show")});

const waNumber="917756039746";
$("#waLink").href=`https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Shri Panchanan Pvt Ltd, I want to place an order.")}`;

$("#placeOrder").onclick=()=>{
 if(!cart.length)return toast("Cart is empty");
 const name=$("#custName").value.trim(),phone=$("#custPhone").value.trim(),address=$("#custAddress").value.trim(),payment=$("#payment").value;
 if(!name||!phone||!address)return toast("Please complete delivery details");
 if(!/^[0-9+\s-]{10,15}$/.test(phone))return toast("Enter a valid mobile number");
 const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
 const order={id:"SP"+Date.now().toString().slice(-8),date:new Date().toLocaleString("en-IN"),total,name,phone,address,payment,status:"Order placed"};
 const orders=JSON.parse(localStorage.getItem("sp_orders")||"[]");orders.unshift(order);localStorage.setItem("sp_orders",JSON.stringify(orders));
 const text=`New Order ${order.id}%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0ATotal: ${money(total)}%0APayment: ${payment==="upi"?"UPI / Advance":"Cash on Delivery"}`;
 window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`,"_blank");
 cart=[];save();closeCart();renderOrders();toast("Order placed successfully")
};
function renderOrders(){
 const orders=JSON.parse(localStorage.getItem("sp_orders")||"[]");
 $("#orderList").innerHTML=orders.length?orders.map(o=>`<div class="empty" style="margin-bottom:10px"><b>${o.id}</b> • ${o.status}<br><small>${o.date} • ${money(o.total)} • ${o.payment==="upi"?"UPI / Advance":"COD"}</small></div>`).join(""):'<div class="empty">Your orders will appear here after checkout.</div>';
}
renderProducts();renderCart();renderOrders();updateCount();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
