window.products = [];
window.siteData = { site: {}, services: [], faq: [] };
window.productsReady = Promise.resolve([]);

const WA_FALLBACK = '905061445706';
function getCart(){ try { const raw=JSON.parse(localStorage.getItem('keymel_cart') || '[]'); if(!Array.isArray(raw)) return []; return raw.filter(x=>x&&Number.isFinite(Number(x.id))&&Number(x.id)>0&&Number(x.qty)>0).map(x=>({...x,id:Number(x.id),qty:Math.max(1,Math.min(20,Number(x.qty)||1))})); } catch { localStorage.removeItem('keymel_cart'); return []; } }
function saveCart(c){ localStorage.setItem('keymel_cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const n=getCart().reduce((a,x)=>a+(Number(x.qty)||0),0); document.querySelectorAll('#cartCount').forEach(e=>e.textContent=n); }
function toast(message){ const old=document.querySelector('.toast'); if(old)old.remove(); const el=document.createElement('div'); el.className='toast'; el.textContent=message; document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('show')); setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},1600); }
function escapeHTML(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function addToCart(id){ const c=getCart(); const variant=document.querySelector('[name=productVariant]:checked')?.value||''; const extras=[...document.querySelectorAll('[name=productExtra]:checked')].map(x=>x.value); const x=c.find(i=>Number(i.id)===Number(id)&&String(i.variant||'')===variant&&JSON.stringify(i.extras||[])===JSON.stringify(extras)); x?x.qty++:c.push({id:Number(id),qty:1,variant,extras}); saveCart(c); toast('Ürün sepete eklendi'); }
function removeFromCart(id){ saveCart(getCart().filter(x=>Number(x.id)!==Number(id))); renderCart(); }
function changeQty(id,d){ let c=getCart(); const x=c.find(i=>Number(i.id)===Number(id)); if(!x)return; x.qty+=d; if(x.qty<1)c=c.filter(i=>Number(i.id)!==Number(id)); saveCart(c); renderCart(); checkoutSummary(); }
function productCard(p){
  return `<article class="card"><a href="single-product-page.html?id=${p.id}" class="card-media"><img src="${escapeHTML(p.img)}" alt="${escapeHTML(p.name)}" loading="lazy" referrerpolicy="no-referrer"><span class="card-tag">${escapeHTML(p.cat)}</span></a><div class="card-body"><h3>${escapeHTML(p.name)}</h3><div class="card-sub">${escapeHTML(p.desc)}</div><div class="card-bottom"><span class="price">${Number(p.discountPercent)>0?`<span class="old-price">${Number(p.originalPrice).toLocaleString('tr-TR')} TL</span>`:''}${Number(p.price).toLocaleString('tr-TR')} TL${Number(p.discountPercent)>0?` <small class="discount-badge">%${Number(p.discountPercent)} indirim</small>`:''}</span><button class="mini-btn" onclick="event.preventDefault();addToCart(${p.id})">Sepete Ekle</button></div></div></article>`;
}
function renderProducts(el,limit,cat){ if(!el)return; let list=window.products.filter(p=>p.published!==false&&!p.isAddon&&(!cat||cat==='Tümü'||p.cat===cat)); if(el.id==='featured' && !cat){const featured=list.filter(p=>p.featured===true); if(featured.length) list=featured;} el.innerHTML=list.slice(0,limit||list.length).map(productCard).join(''); }
function selectCategory(cat){ document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat)); renderProducts(document.getElementById('products'),null,cat); }
function addAddonToCart(id){ const c=getCart(); const x=c.find(i=>Number(i.id)===Number(id)&&!i.variant); x?x.qty++:c.push({id:Number(id),qty:1,variant:'',extras:[]}); saveCart(c); renderCart(); toast('Ek ürün sepete eklendi'); }
function renderCartAddons(){ const el=document.getElementById('cartAddons'); if(!el)return; const inCart=new Set(getCart().map(x=>Number(x.id))); const list=window.products.filter(p=>p.published!==false&&p.isAddon&&p.stockStatus!=='sold_out'&&!inCart.has(Number(p.id))); if(!list.length){el.innerHTML='';return;} el.innerHTML=`<div class="addon-head"><div><span class="eyebrow">Siparişini tamamla</span><h2>Yanına bir şey eklemek ister misiniz?</h2><p>Mağazamızda bulunan ek ürünlerden dilediğinizi sepetinize ekleyebilirsiniz. Zorunlu değildir.</p></div></div><div class="addon-grid">${list.map(p=>`<article class="addon-card"><img src="${escapeHTML(p.img)}" alt="${escapeHTML(p.name)}"><div><strong>${escapeHTML(p.name)}</strong><span>${Number(p.price).toLocaleString('tr-TR')} TL</span><button onclick="addAddonToCart(${p.id})">+ Sepete Ekle</button></div></article>`).join('')}</div>`; }
function renderCart(){
  const el=document.getElementById('cartList'); if(!el)return;
  const c=getCart();
  if(!c.length){ renderCartAddons(); el.innerHTML='<div class="cart-empty"><h2>Sepetiniz boş</h2><p>Çiçeklerinizi seçmek için koleksiyona göz atın.</p><a class="btn" href="shop.html">Çiçekleri Gör</a></div>'; const t=document.getElementById('cartTotal'); if(t)t.textContent='0 TL'; return; }
  let total=0;
  el.innerHTML=c.map(i=>{ const p=window.products.find(x=>Number(x.id)===Number(i.id)); if(!p)return''; const s=Number(p.price)*i.qty; total+=s; return `<div class="cart-item"><img src="${escapeHTML(p.img)}" alt="${escapeHTML(p.name)}" referrerpolicy="no-referrer"><div><div class="eyebrow">${escapeHTML(p.cat)}</div><h3 style="font:600 21px 'Playfair Display';margin:5px 0">${escapeHTML(p.name)}</h3><span>${Number(p.discountPercent)>0?`<span class="old-price">${Number(p.originalPrice).toLocaleString('tr-TR')} TL</span>`:''}${Number(p.price).toLocaleString('tr-TR')} TL</span></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button><button class="mini-btn remove" onclick="removeFromCart(${p.id})">Sil</button></div></div>`; }).join('');
  const t=document.getElementById('cartTotal'); if(t)t.textContent=total.toLocaleString('tr-TR')+' TL'; renderCartAddons();
}
function checkoutSummary(){
  const el=document.getElementById('orderItems'); if(!el)return 0; let total=0;
  el.innerHTML=getCart().map(i=>{ const p=window.products.find(x=>Number(x.id)===Number(i.id)); if(!p)return''; const s=Number(p.price)*i.qty; total+=s; return `<div class="summary-row"><span>${escapeHTML(p.name)} × ${i.qty}</span><b>${s.toLocaleString('tr-TR')} TL</b></div>`; }).join('');
  const t=document.getElementById('checkoutTotal'); if(t)t.textContent=total.toLocaleString('tr-TR')+' TL'; return total;
}
function toggleNav(){ const nav=document.getElementById('nav'); if(nav)nav.classList.toggle('open'); }
function applySettings(data){
  const s=data.site||{}; window.siteData=data;
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href=`tel:+${String(s.whatsapp||WA_FALLBACK).replace(/\D/g,'')}`;a.textContent=s.phone||a.textContent;});
  document.querySelectorAll('a[href*="wa.me/"]').forEach(a=>{a.href=`https://wa.me/${s.whatsapp||WA_FALLBACK}`;});
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href=`mailto:${s.email||'39keymel39@gmail.com'}`;a.textContent=s.email||a.textContent;});
  document.querySelectorAll('a[href*="instagram.com/"]').forEach(a=>{a.href=s.instagram||a.href;a.textContent=s.instagramLabel||a.textContent;});
  document.querySelectorAll('.js-site-address').forEach(e=>e.textContent=s.address||e.textContent);
  document.querySelectorAll('.js-announcement').forEach(e=>e.textContent=s.announcement||e.textContent);
  document.querySelectorAll('.js-hero-title').forEach(e=>e.textContent=s.heroTitle||e.textContent);
  document.querySelectorAll('.js-hero-text').forEach(e=>e.textContent=s.heroText||e.textContent);
  document.querySelectorAll('.js-site-brand,.js-brand').forEach(e=>e.textContent=s.brand||e.textContent); if(s.logo){document.querySelectorAll('.logo').forEach(e=>{if(!e.querySelector('img'))e.innerHTML=`<img src="${escapeHTML(s.logo)}" alt="${escapeHTML(s.brand||'Keymel')}" style="max-height:48px;max-width:180px">`})} if(s.favicon){let l=document.querySelector('link[rel=icon]')||document.head.appendChild(document.createElement('link'));l.rel='icon';l.href=s.favicon} if(s.heroBanner){const h=document.querySelector('.hero');if(h)h.style.backgroundImage=`linear-gradient(rgba(20,16,13,.32),rgba(20,16,13,.32)),url('${s.heroBanner}')`;}
  const map=document.querySelector('.map-link'); if(map&&s.maps)map.href=s.maps;
  const phoneText=document.getElementById('adminPhoneText'); if(phoneText)phoneText.textContent=s.phone||'';
  const services=document.getElementById('servicesGrid'); if(services&&Array.isArray(data.services)){const fallback=['assets/images/keymel/cenek.jpg','assets/images/keymel/aranjman.jpg','assets/images/keymel/guller.jpg','assets/images/keymel/yapay.jpg'];services.innerHTML=data.services.map((x,i)=>`<article class="service service-photo"><img src="${escapeHTML(x.img||fallback[i%fallback.length])}" alt="${escapeHTML(x.title)}" loading="lazy"><div class="service-overlay"><div class="service-kicker">${String(i+1).padStart(2,'0')}</div><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(x.desc)}</p></div></article>`).join('');}
  const faq=document.getElementById('faqGrid'); if(faq&&Array.isArray(data.faq))faq.innerHTML=data.faq.map(x=>`<article class="faq-item"><h3>${escapeHTML(x.q)}</h3><p>${escapeHTML(x.a)}</p></article>`).join('');
  document.querySelectorAll('.js-year').forEach(e=>e.textContent=new Date().getFullYear());
}
async function loadData(){
  const [pr,site]=await Promise.all([fetch('/api/products').then(r=>r.json()),fetch('/api/site').then(r=>r.json())]);
  window.products=Array.isArray(pr)?pr:[]; applySettings(site||{}); return window.products;
}
function setProductImage(src,btn){const main=document.getElementById('productMainImage');if(main)main.src=src;document.querySelectorAll('.product-thumb-btn').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active')}
function changeProductQty(delta){const el=document.getElementById('productQty');if(!el)return;el.value=Math.max(1,Math.min(20,(Number(el.value)||1)+delta))}
function addSingleToCart(id){const qty=Math.max(1,Number(document.getElementById('productQty')?.value)||1);for(let i=0;i<qty;i++)addToCart(id)}
function renderSingle(){ const el=document.getElementById('single'); if(!el)return; const id=Number(new URLSearchParams(location.search).get('id'))||1; const p=window.products.find(x=>Number(x.id)===id)||window.products[0]; if(!p){el.innerHTML='<div class="panel"><h2>Ürün bulunamadı</h2></div>';return;} document.title=`${p.name} | Keymel Çiçekçilik`; const imgs=[p.img,...(Array.isArray(p.images)?p.images:[])].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i); const stock={in_stock:'Stokta',preorder:'Ön Sipariş',sold_out:'Tükendi',whatsapp:'Sadece WhatsApp'}[p.stockStatus]||'Stokta'; el.innerHTML=`<div class="product-premium"><div class="product-gallery"><div class="product-main-wrap"><img id="productMainImage" class="product-main-image" src="${escapeHTML(imgs[0]||p.img)}" alt="${escapeHTML(p.name)}"><div class="image-badges">${p.todayDelivery?'<span>Bugün teslim</span>':''}${Number(p.discountPercent)>0?`<span>%${Number(p.discountPercent)} indirim</span>`:''}</div></div>${imgs.length>1?`<div class="product-thumbs">${imgs.map((src,i)=>`<button class="product-thumb-btn ${i===0?'active':''}" onclick="setProductImage('${escapeHTML(src)}',this)"><img src="${escapeHTML(src)}" alt="${escapeHTML(p.name)} ${i+1}"></button>`).join('')}</div>`:''}<div class="gallery-hint">Gerçek ürün fotoğrafları • Görsele dokunarak farklı açıları inceleyin</div></div><div class="product-buybox"><div class="eyebrow">${escapeHTML(p.cat)}</div><h1>${escapeHTML(p.name)}</h1><div class="product-ratingline"><span class="stock-dot ${p.stockStatus==='sold_out'?'off':''}"></span><strong>${stock}</strong>${p.todayDelivery?'<span>• Lüleburgaz’da bugün teslim seçeneği</span>':''}</div><div class="big-price">${Number(p.discountPercent)>0?`<span class="old-price">${Number(p.originalPrice).toLocaleString('tr-TR')} TL</span>`:''}${Number(p.price).toLocaleString('tr-TR')} TL${Number(p.discountPercent)>0?` <small class="discount-badge">%${Number(p.discountPercent)} indirim</small>`:''}</div><p class="product-description">${escapeHTML(p.desc)} Keymel Çiçekçilik tarafından siparişinize özel ve özenle hazırlanır.</p>${(p.variants||[]).length?`<div class="premium-options"><div class="option-title"><strong>Boyut / seçenek</strong><small>İstediğiniz seçeneği belirleyin</small></div>${p.variants.map((v,i)=>`<label class="choice-card"><input type="radio" name="productVariant" value="${escapeHTML(v.name)}" ${i===0?'checked':''}><span>${escapeHTML(v.name)}</span><b>${Number(v.price).toLocaleString('tr-TR')} TL</b></label>`).join('')}</div>`:''}<div class="purchase-row"><div class="qty-control"><button onclick="changeProductQty(-1)">−</button><input id="productQty" value="1" inputmode="numeric" readonly><button onclick="changeProductQty(1)">+</button></div>${p.stockStatus==='sold_out'?'<button class="btn disabled" disabled>Şu an tükendi</button>':p.stockStatus==='whatsapp'?`<a class="btn" href="https://wa.me/${window.siteData.site.whatsapp||WA_FALLBACK}?text=${encodeURIComponent('Merhaba, '+p.name+' hakkında bilgi almak istiyorum.')}" target="_blank">WhatsApp’tan Sor</a>`:`<button class="btn buy-main" onclick="addSingleToCart(${p.id})">Sepete Ekle</button>`}</div><div class="fulfilment-cards"><div><span>🚚</span><strong>Lüleburgaz Teslimat</strong><small>Tarih ve uygun saat seçerek kapıya teslim.</small></div><div><span>🏪</span><strong>Mağazadan Gel-Al</strong><small>Ödeyin, seçtiğiniz saatte hazır teslim alın.</small></div><div><span>🔒</span><strong>Güvenli Ödeme</strong><small>Kart ödemeleri PayTR altyapısıyla alınır.</small></div></div><div class="product-note"><strong>Özel bir isteğiniz mi var?</strong><span>Renk, sunum veya not taleplerinizi sipariş sırasında yazabilirsiniz.</span><a href="https://wa.me/${window.siteData.site.whatsapp||WA_FALLBACK}?text=${encodeURIComponent('Merhaba, '+p.name+' hakkında bilgi almak istiyorum.')}" target="_blank">WhatsApp’tan danışın →</a></div></div></div>`; }
document.addEventListener('DOMContentLoaded', async ()=>{
  updateCartCount();
  window.productsReady=loadData().catch(err=>{console.error(err);return [];});
  await window.productsReady;
  renderProducts(document.getElementById('featured'),6); renderHomeCollections();
  renderProducts(document.getElementById('products'));
  renderCart(); checkoutSummary(); renderSingle();
  const form=document.getElementById('checkoutForm');
  if(form)form.addEventListener('submit',async e=>{
    e.preventDefault();
    await window.productsReady;
    if(!getCart().length){toast('Sepetiniz boş');return;}
    const data=Object.fromEntries(new FormData(form));
    data.items=getCart();
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='WhatsApp siparişi hazırlanıyor...'}
    try{
      const r=await fetch('/api/orders/whatsapp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const j=await r.json();
      if(!r.ok) throw new Error(j.message||'Sipariş oluşturulamadı.');
      if(j.whatsapp_url){
        localStorage.removeItem('keymel_cart');
        updateCartCount();
        location.href=j.whatsapp_url;
      } else {
        throw new Error('WhatsApp bağlantısı oluşturulamadı.');
      }
    }catch(err){alert(err.message||'Sipariş oluşturulamadı. Lütfen WhatsApp üzerinden doğrudan ulaşın.')}
    finally{if(btn){btn.disabled=false;btn.textContent="WhatsApp'tan Sipariş Ver"}}
  });
});

function renderHomeCollections(){
 const today=document.getElementById('todayProducts'); if(today){const list=window.products.filter(p=>p.published!==false&&!p.isAddon&&p.todayDelivery&&p.stockStatus!=='sold_out').slice(0,8);today.innerHTML=list.map(productCard).join('')||'<div class="empty-home">Bugün teslim ürünleri yakında burada.</div>';}
 const best=document.getElementById('bestProducts'); if(best){let list=window.products.filter(p=>p.published!==false&&!p.isAddon&&p.featured);if(!list.length)list=window.products.filter(p=>p.published!==false&&!p.isAddon);best.innerHTML=list.slice(0,8).map(productCard).join('');}
 const gallery=document.getElementById('dynamicGallery'); if(gallery){const configured=window.siteData.site.galleryImages||[];const imgs=configured.length?configured:['assets/images/keymel/hero-buket.jpg','assets/images/keymel/guller.jpg','assets/images/keymel/papatya.jpg','assets/images/keymel/aranjman.jpg','assets/images/keymel/yapay.jpg','assets/images/keymel/cenek.jpg'];gallery.innerHTML=imgs.slice(0,10).map((src,i)=>`<button class="masonry-item ${i%5===0?'tall':''}" onclick="openLightbox('${escapeHTML(src)}')"><img src="${escapeHTML(src)}" alt="Keymel Çiçekçilik çalışması ${i+1}" loading="lazy"></button>`).join('');}
 const insta=document.getElementById('instagramGallery');if(insta){const imgs=(window.siteData.site.galleryImages||[]).length?window.siteData.site.galleryImages:['assets/images/keymel/guller.jpg','assets/images/keymel/papatya.jpg','assets/images/keymel/aranjman.jpg','assets/images/keymel/yapay.jpg','assets/images/keymel/cenek.jpg','assets/images/keymel/hero-buket.jpg'];insta.innerHTML=imgs.slice(0,6).map(src=>`<a href="${escapeHTML(window.siteData.site.instagram||'#')}" target="_blank"><img src="${escapeHTML(src)}" alt="Keymel Instagram" loading="lazy"><span>Instagram’da gör</span></a>`).join('');}
}
function openLightbox(src){let x=document.getElementById('kmLightbox');if(!x){x=document.createElement('div');x.id='kmLightbox';x.className='km-lightbox';x.onclick=()=>x.classList.remove('show');x.innerHTML='<button>×</button><img>';document.body.appendChild(x)}x.querySelector('img').src=src;x.classList.add('show')}
window.setProductImage=setProductImage;window.changeProductQty=changeProductQty;window.addSingleToCart=addSingleToCart;window.openLightbox=openLightbox;
