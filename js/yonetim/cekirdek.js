/* =====================================================================
   YÖNETİM PANELİ — çekirdek (menü, modal, çekmece, olay günlüğü, CSV)
===================================================================== */
const YON = {};
const YON_MENU = [['genel', 'Genel bakış', 'panel'], ['icerik', 'İçerik akışı', 'icerik'], ['yegler', "YEG'ler", 'yeg'], ['stant', 'Stant yerleşimi', 'stant'], ['takvim', 'Yayın takvimi', 'takvim'], ['qr', 'QR ve analitik', 'qr']];
let yonModul = 'genel';
SAYFA.yonetim = {
  ciz(alt) {
    yonModul = YON[alt] ? alt : 'genel';
    const bekleyen = S.icerik.filter(c => c.asama === 5).length;
    $('#ymYan').innerHTML = `<div class="bas"><b>Yönetim paneli</b><span>YEGFEST 2027 · simülasyon</span></div>
      ${YON_MENU.map(([k, l, i]) => `<a data-m="${k}" class="${k === yonModul ? 'on' : ''}">${ik(i, 18)}${l}${k === 'icerik' && bekleyen ? `<span class="roz">${bekleyen}</span>` : ''}</a>`).join('')}
      <div class="alt">Panel verileri temsilîdir. Yaptığınız değişiklikler bu tarayıcıda saklanır. <a style="padding:0;display:inline;color:#E3B341" id="ymSifir">Sıfırla</a></div>`;
    $$('#ymYan a[data-m]').forEach(a => a.onclick = () => git('yonetim/' + a.dataset.m));
    $('#ymSifir').onclick = () => { if (!confirm('Panelde yaptığınız tüm değişiklikler silinsin mi?')) return; localStorage.removeItem(ANAHTAR); location.reload(); };
    $('#ymIc').innerHTML = YON[yonModul].ciz();
    YON[yonModul].sonra?.();
  }
};
function yKafa(etk, baslik, alt, sag = '') { return `<div class="ym-kafa"><div><span class="simnote">⚠️ Simülasyon verisi · gerçek değildir</span><h2>${baslik}</h2>${alt ? `<p>${alt}</p>` : ''}</div><div class="yatay">${sag}</div></div>`; }

/* olay günlüğü */
function yonetimOlay(tip, metin) {
  S.olay.unshift({ tip, metin, z: Date.now() }); S.olay = S.olay.slice(0, 40); kaydet();
  const l = $('#akisL'); if (l) { l.insertAdjacentHTML('afterbegin', olayHTML(S.olay[0], true)); }
}
const OLAY_IK = { qr: ['📱', '#E6EFFA'], icerik: ['🎬', '#FBF3D9'], stant: ['🏪', '#E8F0E3'], yeg: ['👥', '#F3E8F5'], yayin: ['✅', '#E8F0E3'], takvim: ['📅', '#EEF0F3'] };
const zamanMetin = z => { const s = (Date.now() - z) / 1000; return s < 45 ? 'şimdi' : s < 3600 ? Math.round(s / 60) + ' dk önce' : s < 86400 ? Math.round(s / 3600) + ' sa önce' : Math.round(s / 86400) + ' gün önce'; };
const olayHTML = (o, yeni) => { const [e, bg] = OLAY_IK[o.tip] || ['•', '#eee']; return `<div class="ao ${yeni ? 'yeni' : ''}"><div class="d" style="background:${bg}">${e}</div><div>${o.metin}<small>${zamanMetin(o.z)}</small></div></div>`; };

/* modal + çekmece */
function modal({ baslik, govde, eylem = '' }) {
  const p = document.createElement('div'); p.className = 'mperde';
  p.innerHTML = `<div class="mod"><div class="mb"><h3>${baslik}</h3><button class="kapat-b" data-k>✕</button></div><div class="mg">${govde}</div>${eylem ? `<div class="ma">${eylem}</div>` : ''}</div>`;
  document.body.appendChild(p); requestAnimationFrame(() => p.classList.add('on'));
  const kapat = () => { p.classList.remove('on'); setTimeout(() => p.remove(), 250); };
  p.addEventListener('click', e => { if (e.target === p || e.target.closest('[data-k]')) kapat(); });
  return { el: p, kapat };
}
function cekmece(html) { const c = $('#cekmece'); c.innerHTML = html; c.classList.add('on'); $$('#cekmece [data-kapat]').forEach(b => b.onclick = cekmeceKapat); }
function cekmeceKapat() { $('#cekmece').classList.remove('on'); }

/* CSV */
function csvAyristir(t) {
  const satir = t.replace(/\r/g, '').split('\n').filter(s => s.trim()); if (!satir.length) return [];
  const ayr = satir[0].split(';').length >= satir[0].split(',').length ? ';' : ',';
  const parca = s => { const o = []; let c = '', q = false; for (const ch of s) { if (ch === '"') q = !q; else if (ch === ayr && !q) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o; };
  const bas = parca(satir[0]).map(h => h.toLocaleLowerCase('tr').replace(/\s+/g, ''));
  return satir.slice(1).map(s => { const p = parca(s), o = {}; bas.forEach((h, i) => o[h] = p[i] ?? ''); return o; });
}
function indir(ad, icerik, tip = 'text/csv;charset=utf-8') { const b = new Blob(['﻿' + icerik], { type: tip }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = ad; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
const ilBolge = il => (TRV.iller.find(x => x[0].toLocaleLowerCase('tr') === String(il).toLocaleLowerCase('tr')) || [])[3];
const ilKonum = il => { const x = TRV.iller.find(x => x[0].toLocaleLowerCase('tr') === String(il).toLocaleLowerCase('tr')); return x ? [x[1], x[2]] : null; };

/* küçük grafik yardımcıları */
function kivilcim(v, renk = '#C9A227') { const m = Math.max(...v), n = v.length; return `<svg class="sp" viewBox="0 0 120 44" preserveAspectRatio="none"><path d="M0 44 ${v.map((x, i) => `L${i * 120 / (n - 1)} ${42 - x / m * 34}`).join(' ')} L120 44Z" fill="${renk}22"/><path d="${v.map((x, i) => `${i ? 'L' : 'M'}${i * 120 / (n - 1)} ${42 - x / m * 34}`).join(' ')}" fill="none" stroke="${renk}" stroke-width="2"/></svg>`; }
function yegSecenek(secili = '', filtre = () => true) { return yegler().filter(filtre).map(y => `<option value="${y.id}" ${y.id === secili ? 'selected' : ''}>${esc(y.ad)} · ${esc(y.il)}</option>`).join(''); }
function haritalariGuncelle() { TR3?.yegleriGuncelle(yegler()); FUAR?.yerlesimGuncelle(); }
