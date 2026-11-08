/* =====================================================================
   3D köprüsü: Türkiye haritası ve festival salonu tek örnek olarak
   sayfalar arasında taşınır (yeniden kurulmaz)
===================================================================== */
let TR3 = null, FUAR = null;
function uc3(fn) { if (window.YF3D) fn(window.YF3D); else window.addEventListener('yf3d', () => fn(window.YF3D), { once: true }); }
function yok3d(kap, metin) { kap.insertAdjacentHTML('beforeend', `<div style="position:absolute;inset:0;display:grid;place-items:center;color:#C9D4E3;text-align:center;padding:20px">${ik('dunya', 30)}<div><b style="color:#fff">3D gösterim bu cihazda açılamadı</b><br>${metin || ''}</div></div>`); }

const trIpucu = y => `<b>${esc(y.ad)}</b><span>${esc(y.il || '')}${y.ilce && y.ilce !== y.ad ? ' · ' + esc(y.ilce) : ''} · ${esc(y.bolge)}</span><span style="margin-top:4px;color:${ASAMA_RENK[y.asama]};font-weight:800">${ASAMA[y.asama]}</span>${y.temsili ? '<span style="font-size:11px">Temsilî konum</span>' : ''}`;

function haritaKur(kap, ayar = {}) {
  return new Promise(r => uc3(Y => {
    if (!kap?.isConnected) return r(null);
    if (!Y.destek) { yok3d(kap, 'Liste görünümünü kullanabilirsiniz.'); return r(null); }
    try {
      if (!TR3) TR3 = new Y.Turkiye(kap, { veri: TRV, yegler: yegler(), bolgeRenk: BOLGE_RENK, asamaRenk: ASAMA_RENK, ankara: ANKARA, ipucuHTML: trIpucu, ...ayar });
      else { TR3.tasi(kap); Object.assign(TR3.o, ayar); }
    } catch (e) { console.warn(e); yok3d(kap); return r(null); }
    r(TR3);
  }));
}
function fuarKur(kap, ayar = {}) {
  return new Promise(r => uc3(Y => {
    if (!kap?.isConnected) return r(null);
    if (!Y.destek) { yok3d(kap, 'Pilot ilçelere Genel harita üzerinden ulaşabilirsiniz.'); return r(null); }
    try {
      if (!FUAR) FUAR = new Y.Fuar(kap, { plan: PLAN, ilce: D, qr: QR, slotYeg: stantYeg, bolgeRenk: BOLGE_RENK, insan: matchMedia('(max-width:900px)').matches ? 80 : 160, ...ayar });
      else { FUAR.tasi(kap); Object.assign(FUAR.o, ayar); FUAR.yerlesimGuncelle(); }
    } catch (e) { console.warn(e); yok3d(kap); return r(null); }
    r(FUAR);
  }));
}
