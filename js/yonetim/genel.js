/* =====================================================================
   Yönetim › Genel bakış
===================================================================== */
let ymCanli = null;
YON.genel = {
  ciz() {
    const y = yegler(), yay = yayinda().length, akis = S.icerik.filter(c => c.asama < 6).length, onay = S.icerik.filter(c => c.asama === 5).length;
    const dolu = Object.values(S.stant).filter(Boolean).length + PLAN.pilot.length, top = PLAN.slotlar.length + PLAN.pilot.length;
    return yKafa('', 'Yönetim paneli · <em>YEGFEST 2027</em>', 'İçerik üretimi, stant yerleşimi ve festival ziyaretlerinin özeti.', `<button class="btn sm ghost" onclick="git('harita')">${ik('harita', 15)} Genel harita</button><button class="btn sm" onclick="git('salon')">${ik('salon', 15)} 3D salon</button>`) + `
    <div class="ig ig4">
      <div class="kart kpi">${kivilcim([0, 0, 1, 1, 2, 2, 3, 3, yay])}<small>Yayındaki ilçe sayfası</small><b><span data-to="${yay}">0</span> / ${y.length}</b><span>Pilot aşaması</span></div>
      <div class="kart kpi">${kivilcim([4, 7, 9, 12, 16, 18, 22, 26, akis], '#2E78C7')}<small>Üretim hattında</small><b data-to="${akis}">0</b><span>${onay} içerik başkanlık onayında</span></div>
      <div class="kart kpi">${kivilcim([2, 5, 9, 14, 12, 18, 22, 19, 25], '#5E8C4A')}<small>QR okutma · festival</small><b id="kpiQR" data-to="18420">0</b><span>Simülasyon · canlı artış</span></div>
      <div class="kart kpi live"><small>Bu oturumda sizin</small><b id="myScans">${myScans}</b><span>okuttuğunuz QR · gerçek · ${stamps.size}/3 damga</span></div>
    </div>
    <div class="ig ig-a bolum">
      <div class="kart pad"><div class="yatay" style="justify-content:space-between"><div><h3>Festival QR okutmaları</h3><div class="alt-b">Saatlik · 3 gün · simülasyon</div></div><div class="seg" id="gGun"><button data-g="0" class="on">1. gün</button><button data-g="1">2. gün</button><button data-g="2">3. gün</button></div></div>
        <div class="grafik" id="gGrafik" style="margin-top:10px"></div></div>
      <div class="kart pad"><div class="yatay" style="justify-content:space-between"><h3>Canlı akış</h3><span class="canli">Canlı</span></div><div class="akis-l" id="akisL" style="margin-top:8px">${S.olay.slice(0, 6).map(o => olayHTML(o)).join('')}</div></div>
    </div>
    <div class="ig ig-a bolum">
      <div class="kart pad"><h3>Bölgelere göre içerik ilerlemesi</h3><div class="alt-b">Her çubuk bölgedeki YEG'lerin aşama dağılımı</div>
        <div style="margin-top:10px">${BOLGE.map(b => { const l = y.filter(x => x.bolge === b), n = l.length || 1; return `<div class="bolge-sat"><b>${b}</b><div class="yigin">${ASAMA.map((a, i) => { const c = l.filter(x => x.asama === i).length; return c ? `<i title="${a}: ${c}" style="width:0;background:${ASAMA_RENK[i]}" data-w="${c / n * 100}"></i>` : ''; }).join('')}</div><span style="text-align:right;font-weight:800;color:var(--navy)">${l.length}</span></div>`; }).join('')}</div>
        <div class="yatay" style="gap:12px;margin-top:10px;font-size:11.5px;color:var(--muted)">${ASAMA.map((a, i) => `<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${ASAMA_RENK[i]};margin-right:5px"></i>${a}</span>`).join('')}</div></div>
      <div class="kart pad"><div class="yatay" style="justify-content:space-between"><div><h3>YEG haritası</h3><div class="alt-b">Renk: içerik aşaması · tıklayın</div></div><button class="btn sm ghost" onclick="git('harita')">3D aç</button></div>
        <div id="miniTR" style="margin-top:8px;cursor:pointer">${miniTurkiye()}</div>
        <div class="yatay" style="justify-content:space-between;margin-top:8px;font-size:13px"><span>Stant doluluğu</span><b>${dolu} / ${top}</b></div><div class="yigin" style="margin-top:6px"><i style="width:0;background:linear-gradient(90deg,#C9A227,#2E78C7)" data-w="${dolu / top * 100}"></i></div></div>
    </div>`;
  },
  sonra() {
    $$('#ymIc [data-to]').forEach(sayac);
    setTimeout(() => $$('#ymIc [data-w]').forEach(i => i.style.width = i.dataset.w + '%'), 80);
    grafikCiz(0); $$('#gGun button').forEach(b => b.onclick = () => { $$('#gGun button').forEach(x => x.classList.toggle('on', x === b)); grafikCiz(+b.dataset.g); });
    $('#miniTR').onclick = e => { const id = e.target.closest('[data-id]')?.dataset.id; git(id ? 'harita/' + id : 'harita'); };
    if (!S.olay.length) { const ilk = [['icerik', '<b>Buharkent</b> videosu başkanlık onayına gönderildi'], ['stant', '<b>Ege</b> alanında 22 stant yerleştirildi'], ['yeg', '<b>YEG 041</b> ilçe sayfası taslağı yüklendi'], ['qr', 'Pilot stantlarda QR testleri tamamlandı']]; ilk.forEach(([t, m], i) => S.olay.push({ tip: t, metin: m, z: Date.now() - (i + 1) * 3.6e6 })); kaydet(); $('#akisL').innerHTML = S.olay.slice(0, 6).map(o => olayHTML(o)).join(''); }
    clearInterval(ymCanli);
    let qrN = 18420;
    ymCanli = setInterval(() => {
      if (!$('#kpiQR')) { clearInterval(ymCanli); return; }
      qrN += 1 + Math.floor(Math.random() * 6); $('#kpiQR').textContent = sayi(qrN);
      if (Math.random() < .35) { const y = yegler()[Math.floor(Math.random() * yegler().length)], m = [['qr', `<b>${esc(y.ad)}</b> standında QR okutuldu`], ['icerik', `<b>${esc(y.ad)}</b> için yeni kurgu yüklendi`], ['yeg', `<b>${esc(y.ad)}</b> üretici portresi eklendi`]][Math.floor(Math.random() * 3)]; yonetimOlay(m[0], m[1]); }
    }, 2600);
  }
};
function grafikCiz(g) {
  const r = tohum(31 + g * 7), saat = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const v = saat.map((s, i) => Math.round((600 + 900 * Math.sin((i + 1) / 12 * Math.PI) + r() * 300) * (1 + g * .15)));
  const W = 600, H = 220, P = 30, m = Math.max(...v) * 1.1, x = i => P + i * (W - P * 2) / (v.length - 1), y = n => H - P - n / m * (H - P * 2);
  const yol = v.map((n, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(n).toFixed(1)}`).join(' ');
  let L = 0; for (let i = 1; i < v.length; i++) L += Math.hypot(x(i) - x(i - 1), y(v[i]) - y(v[i - 1]));
  $('#gGrafik').innerHTML = `<svg viewBox="0 0 ${W} ${H}">
    ${[0, .25, .5, .75, 1].map(f => `<line x1="${P}" x2="${W - P}" y1="${y(m * f)}" y2="${y(m * f)}" stroke="rgba(31,58,95,.08)"/><text class="ek" x="4" y="${y(m * f) + 3}">${sayi(Math.round(m * f / 100) * 100)}</text>`).join('')}
    <defs><linearGradient id="gA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C9A227" stop-opacity=".35"/><stop offset="1" stop-color="#C9A227" stop-opacity="0"/></linearGradient></defs>
    <path d="${yol} L${x(v.length - 1)} ${H - P} L${x(0)} ${H - P}Z" fill="url(#gA)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="1s" begin=".6s" fill="freeze"/></path>
    <path class="cizgi-a" d="${yol}" stroke="#B8900F" style="--L:${L.toFixed(0)}"/>
    ${v.map((n, i) => `<circle cx="${x(i)}" cy="${y(n)}" r="3.5" fill="#fff" stroke="#B8900F" stroke-width="2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".3s" begin="${.2 + i * .12}s" fill="freeze"/><title>${saat[i]}:00 · ${sayi(n)} okutma</title></circle>`).join('')}
    ${saat.map((s, i) => `<text class="ek" x="${x(i)}" y="${H - 8}" text-anchor="middle">${s}:00</text>`).join('')}
  </svg><div class="yatay" style="justify-content:space-between;font-size:12.5px;color:var(--muted)"><span>Toplam: <b style="color:var(--navy)">${sayi(v.reduce((a, b) => a + b, 0))}</b></span><span>Zirve: <b style="color:var(--navy)">${saat[v.indexOf(Math.max(...v))]}:00</b></span></div>`;
}
function miniTurkiye() {
  const P = ([lon, lat]) => [(lon - 25.6) * 0.777 * 30, (42.3 - lat) * 30];
  let s = `<svg viewBox="0 0 450 200" style="width:100%;height:auto;display:block;background:#F6F2E8;border-radius:14px">`;
  for (let i = 0; i < TRV.nokta.length; i += 6) { const [x, y] = P([TRV.nokta[i], TRV.nokta[i + 1]]); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#D9CFB5"/>`; }
  yegler().forEach(y => { const [x, z] = P([y.lon, y.lat]); s += `<circle data-id="${y.id}" cx="${x.toFixed(1)}" cy="${z.toFixed(1)}" r="${y.pilot ? 5 : 3}" fill="${ASAMA_RENK[y.asama]}" stroke="#fff" stroke-width="${y.pilot ? 1.5 : .8}"><title>${esc(y.ad)} · ${ASAMA[y.asama]}</title></circle>`; });
  const [ax, ay] = P(ANKARA); s += `<rect x="${ax - 4}" y="${ay - 4}" width="8" height="8" transform="rotate(45 ${ax} ${ay})" fill="#E3B341" stroke="#14263F" stroke-width="1.2"/>`;
  return s + '</svg>';
}
