/* =====================================================================
   Yönetim › İçerik akışı (sürükle-bırak onay hattı)
===================================================================== */
YON.icerik = {
  ciz() {
    return yKafa('', 'İçerik <em>onay akışı</em>', 'Kartları sürükleyerek aşama değiştirin. Başkanlık onayından yayına geçiş kontrol listesiyle yapılır.',
      `<button class="btn sm ghost" id="icFiltreP">Yalnızca pilotlar</button><button class="btn sm gold" id="icYeni">${ik('arti', 15)} Yeni içerik</button>`) +
      `<div class="kanban" id="kanban"></div>`;
  },
  sonra() {
    kanbanCiz();
    let p = false; $('#icFiltreP').onclick = e => { p = !p; e.currentTarget.className = 'btn sm ' + (p ? '' : 'ghost'); kanbanCiz(p); };
    $('#icYeni').onclick = icerikYeni;
  }
};
let kbSadecePilot = false;
function kanbanCiz(sp = kbSadecePilot) {
  kbSadecePilot = sp;
  const l = S.icerik.filter(c => !sp || yeg(c.yeg)?.pilot);
  $('#kanban').innerHTML = ASAMA.map((a, i) => `<div class="kol" data-a="${i}"><div class="kb"><span style="background:none;padding:0;font-size:12.5px;color:${ASAMA_RENK[i]}">● </span>${a}<span>${l.filter(c => c.asama === i).length}</span></div>
    ${l.filter(c => c.asama === i).map(c => { const y = yeg(c.yeg); return `<div class="kk" draggable="true" data-c="${c.id}" id="kk-${c.id}">
      <b>${y?.pilot ? D[y.id].emoji + ' ' : ''}${esc(y?.ad || '—')}</b><div style="font-size:12px;color:var(--muted);margin-top:2px">${esc(c.baslik)}</div>
      <div class="m"><span class="tur">${esc(c.tur)}</span><span>${esc(y?.il || '')}</span></div>
      ${i < 6 ? `<div class="bt">${i === 5 ? `<button class="ok" data-onay="${c.id}">Onayla ✓</button>` : `<button data-ilerlet="${c.id}">İlerlet →</button>`}</div>` : ''}
    </div>`; }).join('')}</div>`).join('');
  $$('#kanban .kk').forEach(k => {
    k.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', k.dataset.c); k.classList.add('surukle'); });
    k.addEventListener('dragend', () => k.classList.remove('surukle'));
  });
  $$('#kanban .kol').forEach(kol => {
    kol.addEventListener('dragover', e => { e.preventDefault(); kol.classList.add('uzerinde'); });
    kol.addEventListener('dragleave', () => kol.classList.remove('uzerinde'));
    kol.addEventListener('drop', e => { e.preventDefault(); kol.classList.remove('uzerinde'); const c = S.icerik.find(x => x.id === e.dataTransfer.getData('text/plain')); if (c) asamaAta(c, +kol.dataset.a); });
  });
  $$('#kanban [data-ilerlet]').forEach(b => b.onclick = () => { const c = S.icerik.find(x => x.id === b.dataset.ilerlet); asamaAta(c, c.asama + 1); });
  $$('#kanban [data-onay]').forEach(b => b.onclick = () => onayModal(S.icerik.find(x => x.id === b.dataset.onay)));
}
function asamaAta(c, a) {
  if (a === 6 && c.asama !== 6) { onayModal(c); return; }
  const y = yeg(c.yeg); c.asama = Math.max(0, Math.min(6, a)); kaydet();
  yonetimOlay('icerik', `<b>${esc(y?.ad)}</b> · ${esc(c.baslik)} → <b>${ASAMA[c.asama]}</b>`);
  kanbanCiz(); $('#kk-' + c.id)?.classList.add('gel'); SAYFA.yonetim.ciz && $('#ymYan') && yanRozet();
}
function yanRozet() { const n = S.icerik.filter(c => c.asama === 5).length, a = $('#ymYan a[data-m="icerik"]'); if (!a) return; a.querySelector('.roz')?.remove(); if (n) a.insertAdjacentHTML('beforeend', `<span class="roz">${n}</span>`); }
function onayModal(c) {
  const y = yeg(c.yeg);
  const m = modal({ baslik: 'Yayın onayı', govde: `<p style="color:var(--muted);font-size:14px;margin-bottom:12px"><b style="color:var(--navy)">${esc(y.ad)}</b> · ${esc(c.baslik)}</p>
    <div class="kontrol-l">${['Yerel teyit (YEG) tamamlandı', 'Üretici açık rızası alındı', 'Coğrafi işaret bilgisi doğrulandı', 'Altyazı ve erişilebilirlik kontrolü yapıldı', 'Kurumsal kimlik ve logo kullanımı uygun'].map(t => `<label><input type="checkbox" class="onk"> ${t}</label>`).join('')}</div>`,
    eylem: `<button class="btn ghost sm" data-k>Vazgeç</button><button class="btn gold sm" id="onayBtn" disabled style="opacity:.5">Onayla ve yayınla</button>` });
  const bt = $('#onayBtn', m.el), kut = $$('.onk', m.el);
  kut.forEach(k => k.onchange = () => { const ok = kut.every(x => x.checked); bt.disabled = !ok; bt.style.opacity = ok ? 1 : .5; });
  bt.onclick = () => {
    m.kapat(); c.asama = 6; if (y && !y.pilot && y.asama < 6) y.asama = Math.max(y.asama, 5); kaydet();
    yonetimOlay('yayin', `<b>${esc(y.ad)}</b> · ${esc(c.baslik)} yayına alındı`);
    kanbanCiz(); $('#kk-' + c.id)?.classList.add('gel'); yanRozet(); konfeti(); toast(`✓ <b>${esc(y.ad)}</b> içeriği yayına alındı`);
  };
}
function icerikYeni() {
  const m = modal({ baslik: 'Yeni içerik', govde: `
    <label class="alan">YEG<select id="niY">${yegSecenek()}</select></label>
    <label class="alan">Başlık<input id="niB" value="Bir İlçe, Bir Hikâye · 60 sn"></label>
    <label class="alan">Tür<select id="niT"><option>Video</option><option>Belgesel</option><option>Fotoğraf</option><option>Metin</option></select></label>`,
    eylem: `<button class="btn ghost sm" data-k>Vazgeç</button><button class="btn sm" id="niK">Ekle</button>` });
  $('#niK', m.el).onclick = () => {
    const c = { id: 'c' + Date.now(), yeg: $('#niY', m.el).value, baslik: $('#niB', m.el).value || 'İçerik', tur: $('#niT', m.el).value, asama: 0 };
    S.icerik.unshift(c); kaydet(); m.kapat(); kanbanCiz(); $('#kk-' + c.id)?.classList.add('gel'); yonetimOlay('icerik', `<b>${esc(yeg(c.yeg).ad)}</b> için yeni içerik planlandı`);
  };
}
