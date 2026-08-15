const CACHE_NAME="shri-panchanan-v3";
const ASSETS=["./","./index.html","./style.css","./script.js","./manifest.json","./icons/icon-192.png","./icons/icon-512.png","./turmeric-powder.png","./red-chilli-powder.png","./coriander-powder.png","./garam-masala.png","./wheat-flour.png","./premium-rice.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==="basic"){const x=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(e.request,x));}return r;}).catch(()=>caches.match("./index.html"))));});
