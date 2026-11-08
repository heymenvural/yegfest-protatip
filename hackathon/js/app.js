/* =====================================================================
   Yönlendirici, üst menü ve prototip aşama simülatörü
===================================================================== */
const SAYFA = {};
const MENU = [['', 'Anasayfa'], ['temalar', 'Temalar'], ['basvuru', 'Başvuru'], ['fikirler', 'Fikirler'], ['juri', 'Jüri paneli'], ['final', 'Festival finali']];

function rota() {
  const h = location.hash.replace(/^#\/?/, '');
  const [yol, ...par] = h.split('/');
  const [ad, sorgu] = (yol || '').split('?');
  return { ad: ad || '', par, sorgu: new URLSearchParams(sorgu || '') };
}

function ciz() {
  const r = rota();
  const s = SAYFA[r.ad === 'fikir' ? 'fikir' : r.ad] || SAYFA[''];
  window.HKSAHNE?.durdur();
  const app = $('#app');
  app.classList.remove('gir'); void app.offsetWidth;
  app.innerHTML = s.html(r);
  app.classList.add('gir');
  s.bagla?.(r);
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === (r.ad === 'fikir' ? 'fikirler' : r.ad)));
  document.body.classList.remove('menu-acik');
  scrollTo({ top: 0, behavior: 'instant' });
  gozlem();
  asamaPill();
}

/* görünürlük animasyonu */
let IO;
function gozlem() {
  IO?.disconnect();
  IO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('gor'); IO.unobserve(e.target); } }), { threshold: .12 });
  $$('.ani').forEach((el, i) => { el.style.setProperty('--g', (el.dataset.g || 0) + 's'); IO.observe(el); });
  $$('[data-say]').forEach(sayac);
}
function sayac(el) {
  const hedef = +el.dataset.say, t0 = performance.now(), d = 1200;
  const f = t => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(hedef * (1 - Math.pow(1 - k, 3))).toLocaleString('tr-TR'); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

/* aşama yardımcıları */
const asamaIdx = () => ASAMALAR.findIndex(a => a.id === DURUM.asama);
const asamaGecti = id => asamaIdx() >= ASAMALAR.findIndex(a => a.id === id);
function asamaYaz(id) { DURUM.asama = id; kaydet(); ciz(); toast('Simülasyon aşaması: ' + ASAMALAR.find(a => a.id === id).ad); }

function asamaPill() {
  const p = $('#proto');
  p.innerHTML = `<span class="pt">Prototip</span><label>Simülasyon aşaması
    <select id="asamaSec">${ASAMALAR.map(a => `<option value="${a.id}" ${a.id === DURUM.asama ? 'selected' : ''}>${a.ay} · ${a.ad}</option>`).join('')}</select></label>
    <button id="sifirBtn" title="Örnek verilere dön">↺</button>`;
  $('#asamaSec').onchange = e => asamaYaz(e.target.value);
  $('#sifirBtn').onclick = () => { sifirla(); ciz(); toast('Prototip verileri sıfırlandı'); };
}

/* geri sayım */
let GS;
function geriSayim(el, hedef) {
  clearInterval(GS);
  const f = () => {
    let ms = Math.max(0, new Date(hedef) - Date.now());
    const g = Math.floor(ms / 864e5); ms -= g * 864e5; const s = Math.floor(ms / 36e5); ms -= s * 36e5; const d = Math.floor(ms / 6e4); const sn = Math.floor((ms - d * 6e4) / 1000);
    if (!document.body.contains(el)) return clearInterval(GS);
    el.innerHTML = [[g, 'gün'], [s, 'saat'], [d, 'dakika'], [sn, 'saniye']].map(([n, l]) => `<div><b>${String(n).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  };
  f(); GS = setInterval(f, 1000);
}

/* ortak bileşenler */
function fikirKart(f, i = 0) {
  const t = tema(f.tema), oy = DURUM.oylar[f.id];
  return `<article class="fk ani" data-g="${(i % 6) * .05}" style="--tc:${t.renk}">
    <a class="fk-a" href="#/fikir/${f.id}">
      <div class="fk-ust"><span class="tm">${t.ikon} ${t.ad}</span>${f.yeni ? '<span class="yeni">Yeni başvuru</span>' : '<span class="tms">temsilî</span>'}</div>
      <h3>${esc(f.baslik)}</h3>
      <p>${esc(f.cozum).slice(0, 130)}${f.cozum.length > 130 ? '…' : ''}</p>
      <div class="etk">${(f.etiket || []).slice(0, 3).map(e => `<span>${esc(e)}</span>`).join('')}</div>
    </a>
    <div class="fk-alt"><div><b>${esc(f.takim)}</b><span>${esc(f.il)} · ${f.kisi} kişi</span></div>
      <button class="oy ${oy ? 'on' : ''}" data-oy="${f.id}" aria-label="Oy ver"><i>${oy ? '♥' : '♡'}</i><b>${oySayisi(f)}</b></button></div>
  </article>`;
}
function oyBagla(kok = document) {
  $$('[data-oy]', kok).forEach(b => b.onclick = e => {
    e.preventDefault(); const id = b.dataset.oy;
    if (DURUM.oylar[id]) delete DURUM.oylar[id]; else DURUM.oylar[id] = 1;
    kaydet(); const f = fikir(id), on = !!DURUM.oylar[id];
    b.classList.toggle('on', on); b.querySelector('i').textContent = on ? '♥' : '♡'; b.querySelector('b').textContent = oySayisi(f);
    if (on) { b.classList.remove('pat'); void b.offsetWidth; b.classList.add('pat'); }
  });
}
function konfeti() {
  const c = document.createElement('canvas'); c.className = 'konfeti'; document.body.appendChild(c);
  const x = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
  const R = ['#C9A227', '#E3B341', '#2E78C7', '#5E8C4A', '#1F3A5F', '#8EC3F0'];
  const P = Array.from({ length: 160 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .45, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6, r: Math.random() * 6 + 4, a: Math.random() * 6, c: R[Math.floor(Math.random() * R.length)] }));
  let t = 0; (function f() { x.clearRect(0, 0, W, H); P.forEach(p => { p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }); if (++t < 150) requestAnimationFrame(f); else c.remove(); })();
}

/* başlat */
addEventListener('DOMContentLoaded', () => {
  $('#nav').innerHTML = MENU.map(([r, l]) => `<a href="#/${r}" data-r="${r}">${l}</a>`).join('');
  $('#menuBtn').onclick = () => document.body.classList.toggle('menu-acik');
  addEventListener('hashchange', ciz);
  addEventListener('scroll', () => document.body.classList.toggle('kaydi', scrollY > 30), { passive: true });
  ciz();
});
