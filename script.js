const products=[
{id:1,name:"Turmeric Powder",cat:"Spices",price:120,emoji:"🟡",image:"assets/turmeric-powder.png"},
{id:2,name:"Red Chilli Powder",cat:"Spices",price:180,emoji:"🌶️",image:"assets/red-chilli-powder.png"},
{id:3,name:"Coriander Powder",cat:"Spices",price:140,emoji:"🌿",image:"assets/coriander-powder.png"},
{id:4,name:"Garam Masala",cat:"Spices",price:260,emoji:"🫙",image:"assets/garam-masala.png"},
{id:5,name:"Wheat Flour",cat:"Flour",price:55,emoji:"🌾",image:"assets/wheat-flour.png"},
{id:6,name:"Premium Rice",cat:"Rice",price:70,emoji:"🍚",image:"assets/premium-rice.png"}];

let cart=JSON.parse(localStorage.getItem("sp_cart")||"[]"),
    orders=JSON.parse(localStorage.getItem("sp_orders")||"[]"),
    cat="All";

const money=n=>"₹"+n.toLocaleString("en-IN");

function setCat(c,b){
  cat=c;
  document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  renderProducts();
}

function productImage(p, cls="productImg"){
  return `<img class="${cls}" src="${p.image}" alt="${p.name}" loading="lazy"
    onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
    <span class="imageFallback" style="display:none">${p.emoji}</span>`;
}

function renderProducts(){
  const q=document.getElementById("search").value.toLowerCase();
  const list=products.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(q));
  document.getElementById("productGrid").innerHTML=list.map(p=>`
    <article class="product">
      <div class="pic">${productImage(p)}</div>
      <div class="cat">${p.cat}</div>
      <h3>${p.name}</h3>
      <div class="price">${money(p.price)} <small>/ kg</small></div>
      <button class="add" onclick="add(${p.id})">Add to Cart</button>
    </article>`).join("");
}

function save(){
  localStorage.setItem("sp_cart",JSON.stringify(cart));
  localStorage.setItem("sp_orders",JSON.stringify(orders));
}

function add(id){
  let x=cart.find(i=>i.id===id);
  x?x.qty++:cart.push({id,qty:1});
  save();
  renderCart();
  openCart();
}

function change(id,d){
  let x=cart.find(i=>i.id===id);
  if(!x)return;
  x.qty+=d;
  if(x.qty<=0)cart=cart.filter(i=>i.id!==id);
  save();
  renderCart();
}

function renderCart(){
  document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  let box=document.getElementById("cartItems");
  if(!cart.length){
    box.innerHTML="<p class='muted'>Your cart is empty.</p>";
    document.getElementById("cartTotal").textContent="₹0";
    return;
  }

  let total=0;
  box.innerHTML=cart.map(x=>{
    let p=products.find(y=>y.id===x.id);
    let sum=p.price*x.qty;
    total+=sum;
    return `<div class="cartItem">
      <div class="thumb">${productImage(p,"docu
