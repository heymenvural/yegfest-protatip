/* =====================================================================
   FESTİVAL FİNALİ — kürsü, sahne programı, seyirci oylaması
===================================================================== */
SAYFA.final = {
  html() {
    const uc = ilkUc(), ac = asamaGecti('final');
    const kursu = [uc[1], uc[0], uc[2]];
    const PROG = [['10.00', 'Açılış ve hackathon süreci', 'Koordinasyon Masası'], ['10.20', `1. sunum · ${uc[0]?.takim || '—'}`, '7 dk sunum + 3 dk soru'], ['10.35', `2. sunum · ${uc[1]?.takim || '—'}`, '7 dk sunum + 3 dk soru'], ['10.50', `3. sunum · ${uc[2]?.takim || '—'}`, '7 dk sunum + 3 dk soru'], ['11.05', 'Seyirci oylaması', 'QR ile canlı oy'], ['11.15', 'Ödül töreni', 'Bakanlık ve sponsor temsilcileri'], ['11.30', 'Kurumlarla birebir görüşmeler', 'Destek programları masası']];
    return `<section class="final-bas"><canvas id="isik"></canvas><div class="fb-ic">
      <small>YEGFEST 2027 · İnovasyon sahnesi</small><h1>Sahnedeki <em>üç fikir</em></h1>
      <p class="lead">${ac ? 'Çevrimiçi finalin ardından ilk üç takım festivalde ana sahnede sunum yapar.' : 'Simülasyonda final henüz yapılmadı; aşağıdaki kürsü mevcut jüri sıralamasına göre bir önizlemedir.'}</p>
      <div class="gs" id="gsF"></div></div>
      <div class="kursu">${kursu.map((f, i) => { if (!f) return '<div></div>'; const sira = [2, 1, 3][i], t = tema(f.tema);
        return `<div class="k k${sira}" style="--tc:${t.renk}"><div class="kk"><div class="md">${['🥇', '🥈', '🥉'][sira - 1]}</div><small>${ODULLER[sira - 1].ad}</small><b>${esc(f.baslik)}</b><span>${esc(f.takim)} · ${esc(f.il)}</span><a href="#/fikir/${f.id}">Fikri gör →</a></div><div class="bas2"><b>${sira}</b></div></div>`; }).join('')}</div>
    </section>
    <section class="blok"><div class="iki">
      <div class="kart ani"><h3>Sahne programı</h3><div class="prog">${PROG.map(([s, a, d]) => `<div><time>${s}</time><div><b>${esc(a)}</b><span>${d}</span></div></div>`).join('')}</div></div>
      <div class="kart ani seyirci" data-g=".08"><h3>Seyirci oylaması</h3><p class="kc">Salondaki ziyaretçiler QR'ı okutup favori fikrine oy verir; sonuç ekranda canlı güncellenir.</p>
        <div class="sy"><div class="qr">${qrSVG(SITE + '/hackathon#/fikirler')}</div><div class="oybar">${uc.map(f => { const n = oySayisi(f), top = uc.reduce((t, x) => t + oySayisi(x), 0) || 1; return `<div><span>${esc(f.takim)}</span><div class="cb"><i style="--w:${Math.round(n / top * 100)}%"></i></div><b>${Math.round(n / top * 100)}%</b></div>`; }).join('')}</div></div></div>
    </div></section>
    <section class="blok"><div class="bas ani"><small>Festivalden sonra</small><h2>Fikirden <em>projeye</em></h2></div>
      <div class="akis ani">${[['🏆', 'İlk 3', 'Pilot uygulama ve sponsor desteği'], ['🧑‍🏫', 'İlk 10', 'Mentorlukla destek programı başvurusu'], ['🌱', 'Tüm fikirler', 'Fikir havuzunda YEG’lerle paylaşılır'], ['📘', 'Etki raporu', 'Festivalden 30 gün sonra yayımlanır']].map(([i, b, p]) => `<div><i>${i}</i><b>${b}</b><p>${p}</p></div>`).join('<span>→</span>')}</div>
    </section>`;
  },
  bagla() {
    geriSayim($('#gsF'), HK.festival);
    requestAnimationFrame(() => setTimeout(() => $$('.kursu .k').forEach(k => k.classList.add('cik')), 60));
    setTimeout(() => $$('.oybar i').forEach(i => i.style.width = i.style.getPropertyValue('--w')), 400);
    isiklar($('#isik'));
  }
};

function isiklar(c) {
  if (!c) return; const x = c.getContext('2d'); let t = 0;
  const rs = () => { c.width = c.offsetWidth * devicePixelRatio; c.height = c.offsetHeight * devicePixelRatio; };
  rs(); addEventListener('resize', rs);
  (function f() {
    if (!document.body.contains(c)) return; t += .008;
    const W = c.width, H = c.height; x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
    [[.2, '201,162,39'], [.5, '142,195,240'], [.8, '201,162,39']].forEach(([px, col], i) => {
      const a = Math.sin(t * 1.3 + i * 2) * .35, ox = W * px, len = H * 1.15;
      const g = x.createLinearGradient(ox, 0, ox, len); g.addColorStop(0, `rgba(${col},.32)`); g.addColorStop(1, `rgba(${col},0)`);
      x.save(); x.translate(ox, -20); x.rotate(a); x.fillStyle = g; x.beginPath(); x.moveTo(-14, 0); x.lineTo(14, 0); x.lineTo(W * .16, len); x.lineTo(-W * .16, len); x.closePath(); x.fill(); x.restore();
    });
    requestAnimationFrame(f);
  })();
}
