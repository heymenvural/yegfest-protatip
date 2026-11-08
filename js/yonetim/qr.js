/* =====================================================================
   Yönetim › QR ve analitik
===================================================================== */
YON.qr = {
  ciz() {
    return yKafa('', 'QR kodlar ve <em>analitik</em>', 'Pilot stantların QR kodları canlıdır; telefonla okutulduğunda ilçe sayfası açılır. Diğer YEG\'ler için stant QR kartı üretebilirsiniz.',
      `<button class="btn sm gold" id="qrYazdir">${ik('yazdir', 15)} Pilot QR kartlarını yazdır</button>`) + `
    <div class="kart pad"><h3>Pilot stant QR kodları</h3><div class="alt-b">Okutun: ilçe sayfası telefonda açılır</div>
      <div class="qr-g" style="margin-top:12px">${ORDER.map(k => `<div class="qr-k">${qr(k)}<b>${D[k].emoji} ${D[k].name}</b><span>${esc(ilceUrl(k).replace(/^https?:\/\//, ''))}</span><div class="yatay" style="justify-content:center;margin-top:8px"><button class="btn sm ghost" onclick="openFull('${k}')">Sayfayı aç</button></div></div>`).join('')}</div></div>
    <div class="ig ig2 bolum">
      <div class="kart pad"><h3>QR kartı üret</h3><div class="alt-b">Herhangi bir YEG için stant kartı (örnek bağlantı)</div>
        <label class="alan" style="margin-top:12px">YEG<select id="qrY">${yegSecenek('', y => !y.pilot)}</select></label>
        <div class="yatay" style="align-items:flex-start;gap:16px"><div class="qr-k" id="qrOn" style="width:200px;flex:none"></div><div style="font-size:13px;color:var(--muted);flex:1;min-width:180px">Bağlantı ilçe sayfası yayına girdiğinde aktif olur. Kart standın QR panosuna basılır; okutmalar bu panelde ilçe bazında izlenir.<div class="yatay" style="margin-top:12px"><button class="btn sm" id="qrTek">${ik('yazdir', 14)} Bu kartı yazdır</button></div></div></div></div>
      <div class="kart pad"><h3>Saatlik okutma yoğunluğu</h3><div class="alt-b">3 festival günü · simülasyon</div><div id="qrIsi" style="margin-top:12px"></div>
        <h3 style="margin-top:18px">En çok okutulan stantlar</h3><div id="qrEn" style="margin-top:6px"></div></div>
    </div>`;
  },
  sonra() {
    const on = () => { const y = yeg($('#qrY').value); $('#qrOn').innerHTML = `${qrSVG(SITE + '/ilce/' + y.id)}<b>${esc(y.ad)}</b><span>${esc(y.il)} · ${yegStant(y.id) || 'stant yok'}</span>`; };
    $('#qrY').onchange = on; on();
    $('#qrTek').onclick = () => { const y = yeg($('#qrY').value); qrYazdir([{ ad: y.ad, alt: `${y.il} · ${y.bolge} · Stant ${yegStant(y.id) || '—'}`, svg: qrSVG(SITE + '/ilce/' + y.id), renk: BOLGE_RENK[y.bolge] }]); };
    $('#qrYazdir').onclick = () => qrYazdir(ORDER.map(k => ({ ad: D[k].name, alt: `${D[k].il} · ${D[k].bolge} · ${D[k].tl}`, svg: qr(k), renk: D[k].c })));
    // ısı haritası
    const r = tohum(9), saat = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    $('#qrIsi').innerHTML = `<div class="isi"><span></span>${saat.map(s => `<span style="text-align:center">${s}</span>`).join('')}${[0, 1, 2].map(g => `<span>${g + 1}. gün</span>${saat.map((s, i) => { const v = Math.sin((i + 1) / 12 * Math.PI) * (0.6 + g * .15) + r() * .35; return `<i title="${s}:00 · ${Math.round(v * 900)} okutma" style="background:rgba(201,162,39,${Math.min(1, v).toFixed(2)})"></i>`; }).join('')}`).join('')}</div>`;
    const en = [['Safranbolu', 4820, 'safranbolu'], ['Buharkent', 4310, 'buharkent'], ['Finike', 3970, 'finike'], ...yegler().filter(y => !y.pilot).slice(0, 3).map((y, i) => [y.ad, 1900 - i * 260, null])];
    $('#qrEn').innerHTML = en.map(([a, n, k]) => `<div class="bolge-sat" style="grid-template-columns:120px 1fr 64px"><b>${k ? D[k].emoji + ' ' : ''}${esc(a)}</b><div class="yigin"><i style="width:0;background:linear-gradient(90deg,#C9A227,#2E78C7)" data-w="${n / 5000 * 100}"></i></div><span style="text-align:right;font-weight:800;color:var(--blue)">${sayi(n)}</span></div>`).join('');
    setTimeout(() => $$('#qrEn [data-w]').forEach(i => i.style.width = i.dataset.w + '%'), 80);
  }
};
function qrYazdir(kartlar) {
  const w = open('', '_blank'); if (!w) { toast('Açılır pencere engellendi'); return; }
  w.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>YEGFEST QR kartları</title><style>
    body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;margin:0;padding:20px;display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
    .k{width:90mm;height:130mm;border-radius:6mm;overflow:hidden;border:1px solid #ddd;display:flex;flex-direction:column;page-break-inside:avoid}
    .u{padding:8mm 7mm;color:#fff}.u small{font-size:9pt;letter-spacing:.15em;font-weight:800;opacity:.85}.u h1{margin:2mm 0 0;font-size:22pt}
    .q{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4mm}.q svg{width:58mm;height:58mm}
    .q b{margin-top:3mm;font-size:12pt;letter-spacing:.12em;color:#1F3A5F}.q span{font-size:9pt;color:#666;text-align:center;margin-top:1mm}
    .a{background:#1F3A5F;color:#E3B341;text-align:center;font-weight:800;padding:3mm;font-size:10pt;letter-spacing:.1em}
    @media print{body{padding:0}}</style></head><body>${kartlar.map(k => `<div class="k"><div class="u" style="background:${k.renk}"><small>YEGFEST · STANT</small><h1>${esc(k.ad)}</h1></div><div class="q">${k.svg.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '')}<b>OKUT · DİNLE</b><span>${esc(k.alt)}</span></div><div class="a">YEG<span style="color:#fff">FEST</span> · 155 İLÇE · TEK ÇATI</div></div>`).join('')}
    <script>setTimeout(()=>print(),400)<\/script></body></html>`);
  w.document.close();
}
