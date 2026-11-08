/* =====================================================================
   YEGFEST · Veri modeli
   - 155 YEG: 3 pilot ilçe (gerçek içerik) + 152 temsilî kayıt
     (gerçek liste Yönetim > YEG'ler > CSV içe aktar ile yüklenebilir)
   - İçerik onay akışı, stant yerleşimi, yayın takvimi
   - Durum yalnızca bu tarayıcıda (localStorage) tutulur
===================================================================== */
const $ = (s, k = document) => k.querySelector(s), $$ = (s, k = document) => [...k.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sayi = n => Number(n).toLocaleString('tr-TR');

const BOLGE = TRV.bolgeler;
const BOLGE_RENK = { 'Marmara': '#3A7BD5', 'Ege': '#8C5A9E', 'Akdeniz': '#E07B1F', 'İç Anadolu': '#C9A227', 'Karadeniz': '#3F8F5E', 'Doğu Anadolu': '#B4543F', 'Güneydoğu Anadolu': '#9A6B3A' };
const BOLGE_KISA = { 'Marmara': 'MAR', 'Ege': 'EGE', 'Akdeniz': 'AKD', 'İç Anadolu': 'İÇA', 'Karadeniz': 'KAR', 'Doğu Anadolu': 'DOĞ', 'Güneydoğu Anadolu': 'GDA' };
const ANKARA = [32.85, 39.93];

/* İçerik üretim aşamaları (ilçe sayfası + video) */
const ASAMA = ['Planlandı', 'Çekim', 'Kurgu', 'Yerel teyit', 'Koordinasyon', 'Başkanlık onayı', 'Yayında'];
const ASAMA_RENK = ['#9AA6B5', '#6E8FB8', '#2E78C7', '#7B4FA0', '#C9A227', '#E07B1F', '#5E8C4A'];

const PILOT_KONUM = { buharkent: [28.75, 37.97, 'Aydın', 'Ege'], safranbolu: [32.69, 41.25, 'Karabük', 'Karadeniz'], finike: [30.15, 36.30, 'Antalya', 'Akdeniz'] };

/* tohumlu rastgele (her açılışta aynı simülasyon) */
function tohum(n) { let s = n; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

function temelYegler() {
  const r = tohum(77), l = [];
  ORDER.forEach(k => { const [lon, lat, il, b] = PILOT_KONUM[k]; l.push({ id: k, ad: D[k].name, il, ilce: D[k].name, bolge: b, lon, lat, asama: 6, pilot: true, temsili: false, urun: D[k].chips[0] }); });
  TRV.yeg.forEach(([lon, lat, il, bi], i) => {
    const x = r(), asama = x < .38 ? 0 : x < .56 ? 1 : x < .72 ? 2 : x < .83 ? 3 : x < .91 ? 4 : 5;
    l.push({ id: 'y' + String(i + 1).padStart(3, '0'), ad: 'YEG ' + String(i + 4).padStart(3, '0'), il, ilce: '', bolge: BOLGE[bi], lon, lat, asama, pilot: false, temsili: true, urun: '' });
  });
  return l;
}

/* ---------- Durum ---------- */
const ANAHTAR = 'yf2';
let S;
function ilkDurum() { return { yegler: null, stant: null, icerik: null, takvim: null, olay: [] }; }
try { S = Object.assign(ilkDurum(), JSON.parse(localStorage.getItem(ANAHTAR)) || {}); } catch (e) { S = ilkDurum(); }
function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(S)); } catch (e) { } }
if (!S.yegler) S.yegler = temelYegler();
const yegler = () => S.yegler;
const yeg = id => S.yegler.find(y => y.id === id);
const yayinda = () => S.yegler.filter(y => y.asama === 6);

/* ---------- Salon planı (3D salon ve yönetim panelinde ortak) ----------
   Birim: metre. x sağa, z izleyiciye doğru. 7 bölge alanı + pilot meydanı. */
const STANT = { w: 2.6, d: 2.3, ax: 2.9 };
function salonPlani() {
  const kota = {}; BOLGE.forEach(b => kota[b] = TRV.yeg.filter(y => BOLGE[y[3]] === b).length);
  const kolon = 6, alanW = kolon * STANT.ax;
  const yer = [
    ['Marmara', -47, -30], ['Ege', -23, -30], ['Akdeniz', 1, -30], ['İç Anadolu', 25, -30],
    ['Karadeniz', -47, 0], ['Güneydoğu Anadolu', -23, 0], ['Doğu Anadolu', 25, 0]
  ];
  const alanlar = [], slotlar = [];
  yer.forEach(([b, x0, z0]) => {
    const n = Math.max(kota[b], 1), satir = Math.ceil(n / kolon);
    let z = z0; const satirZ = [];
    for (let r = 0; r < satir; r++) { satirZ.push(z); z += STANT.d + (r % 2 === 1 ? 2.6 : 0); }
    const derin = z - z0;
    alanlar.push({ bolge: b, x: x0 - 1.2, z: z0 - 1.6, w: alanW + 0.9, d: derin + 1.6, renk: BOLGE_RENK[b] });
    for (let i = 0; i < Math.max(n, 1); i++) {
      const r = Math.floor(i / kolon), c = i % kolon;
      slotlar.push({ id: BOLGE_KISA[b] + '-' + String(i + 1).padStart(2, '0'), bolge: b, x: x0 + c * STANT.ax + STANT.w / 2, z: satirZ[r] + STANT.d / 2, yon: r % 2 === 0 ? -1 : 1 });
    }
  });
  const pilot = ORDER.map((k, i) => ({ id: 'P-' + (i + 1), k, x: 3.6 + i * 5.6, z: 7, yon: 1 }));
  return { alanlar, slotlar, pilot, sahne: { x: 9.2, z: 23.5, w: 15, d: 4 }, meydan: { x: 0, z: 0.4, w: 18.4, d: 26 }, sinir: { x0: -51, x1: 45, z0: -33, z1: 29 } };
}
const PLAN = salonPlani();

function varsayilanYerlesim() {
  const m = {};
  BOLGE.forEach(b => {
    const s = PLAN.slotlar.filter(x => x.bolge === b), y = S.yegler.filter(x => !x.pilot && x.bolge === b);
    s.forEach((sl, i) => { if (y[i]) m[sl.id] = y[i].id; });
  });
  return m;
}
if (!S.stant) S.stant = varsayilanYerlesim();
const stantYeg = slotId => S.stant[slotId] ? yeg(S.stant[slotId]) : null;
const yegStant = id => { const p = PLAN.pilot.find(x => x.k === id); if (p) return p.id; return Object.keys(S.stant).find(k => S.stant[k] === id) || null; };

/* ---------- İçerik akışı ---------- */
function varsayilanIcerik() {
  const l = [
    { id: 'c-bk', yeg: 'buharkent', baslik: 'Bir İlçe, Bir Hikâye · 60 sn', tur: 'Video', asama: 5 },
    { id: 'c-sb', yeg: 'safranbolu', baslik: 'Yöresel Sofra: Zerde · 2 dk', tur: 'Video', asama: 4 },
    { id: 'c-fn', yeg: 'finike', baslik: 'Ürünün Yolculuğu: Portakal · 4 dk', tur: 'Belgesel', asama: 3 }
  ];
  const r = tohum(5), turler = [['Bir İlçe, Bir Hikâye · 60 sn', 'Video'], ['Yöresel Sofra · 2 dk', 'Video'], ['Ürünün Yolculuğu · 4 dk', 'Belgesel'], ['Üretici portresi', 'Fotoğraf'], ['İlçe sayfası metni', 'Metin']];
  S.yegler.filter(y => !y.pilot && y.asama >= 1).slice(0, 26).forEach((y, i) => {
    const t = turler[Math.floor(r() * turler.length)];
    l.push({ id: 'c-' + y.id, yeg: y.id, baslik: t[0], tur: t[1], asama: Math.min(5, Math.max(1, y.asama)) });
  });
  return l;
}
if (!S.icerik) S.icerik = varsayilanIcerik();

/* ---------- Yayın takvimi ---------- */
if (!S.takvim) {
  S.takvim = {};
  const g = new Date(); g.setDate(1);
  const ay = g.getFullYear() + '-' + String(g.getMonth() + 1).padStart(2, '0');
  [[3, 'Buharkent · Bir İlçe, Bir Hikâye', 'buharkent'], [5, 'Safranbolu · Yöresel Sofra: Zerde', 'safranbolu'], [10, 'Finike · Ürünün Yolculuğu', 'finike'], [12, 'YEG 017 · İlçe sayfası', null], [17, 'YEG 042 · Üretici portresi', null], [19, 'YEG 008 · Bir İlçe, Bir Hikâye', null], [24, 'YEG 093 · Yöresel Sofra', null], [26, 'Ayın belgeseli', null]]
    .forEach(([d, t, k]) => { (S.takvim[ay + '-' + String(d).padStart(2, '0')] ??= []).push({ t, k }); });
}
kaydet();

/* ---------- Pasaport (önceki sürümle aynı anahtarlar) ---------- */
let stamps = new Set(), myScans = 0;
try { JSON.parse(localStorage.getItem('yf-st') || '[]').forEach(x => stamps.add(x)); myScans = +localStorage.getItem('yf-sc') || 0; } catch (e) { }
function save() { try { localStorage.setItem('yf-st', JSON.stringify([...stamps])); localStorage.setItem('yf-sc', myScans); } catch (e) { } }

/* ---------- Ortak yardımcılar ---------- */
function toast(t) { const x = $('#toast'); x.innerHTML = t; x.classList.add('on'); clearTimeout(x._t); x._t = setTimeout(() => x.classList.remove('on'), 2800); }
function sayac(el) { const to = +el.dataset.to, t0 = performance.now(); (function f(t) { const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('tr-TR'); if (p < 1) requestAnimationFrame(f); })(t0); }
function konfeti() {
  const cs = ['#C9A227', '#2E78C7', '#E07B1F', '#7B4FA0', '#5E8C4A'];
  for (let i = 0; i < 90; i++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = cs[i % 5]; c.style.animationDuration = (2 + Math.random() * 2.5) + 's'; c.style.animationDelay = Math.random() * .6 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 5500); }
}
function qrSVG(metin, renk = '#14263F') {
  if (typeof qrcode === 'undefined') return '';
  const q = qrcode(0, 'M'); q.addData(metin); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2},${r + 2}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 4} ${n + 4}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="${renk}"/></svg>`;
}
const SITE = location.origin.startsWith('http') ? location.origin : 'https://yegfest-prototip.vercel.app';
const ilceUrl = k => SITE + '/ilce/' + k;
