const products=[
{name:"Turmeric Powder",price:"₹120/kg",emoji:"🟡"},
{name:"Red Chilli Powder",price:"₹180/kg",emoji:"🌶️"},
{name:"Coriander Powder",price:"₹140/kg",emoji:"🌿"},
{name:"Garam Masala",price:"₹260/kg",emoji:"🧂"},
{name:"Wheat Flour",price:"₹55/kg",emoji:"🌾"},
{name:"Premium Rice",price:"₹70/kg",emoji:"🍚"}
];
const grid=document.getElementById("productGrid");
const select=document.getElementById("product");
products.forEach((p,i)=>{
 grid.insertAdjacentHTML("beforeend",`<article class="card"><div class="emoji">${p.emoji}</div><h3>${p.name}</h3><div class="price">${p.price}</div><div class="muted">Bulk packing: 5kg, 15kg, 20kg, 50kg</div></article>`);
 select.insertAdjacentHTML("beforeend",`<option value="${p.name}">${p.name}</option>`);
});
const WA="917756039746";
function openWA(text){location.href="https://wa.me/"+WA+"?text="+encodeURIComponent(text)}
document.getElementById("heroWhatsApp").onclick=()=>openWA("Hello Shri Panchanan Pvt Ltd, I am interested in your B2B products. Please share your bulk quotation.");
document.getElementById("orderForm").onsubmit=e=>{
 e.preventDefault();
 const msg=`B2B Inquiry - Shri Panchanan Pvt Ltd%0AName/Company: ${buyer.value}%0APhone: ${phone.value}%0AProduct: ${product.value}%0AQuantity: ${qty.value}%0ANote: ${note.value||"N/A"}`;
 location.href="https://wa.me/"+WA+"?text="+encodeURIComponent(msg);
};
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});
installBtn.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true}};
