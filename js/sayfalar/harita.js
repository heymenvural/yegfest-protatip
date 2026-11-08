/* =====================================================================
   GENEL HARİTA — Türkiye'deki bütün YEG'ler (3D)
===================================================================== */
const HF = { q: '', bolge: '', durum: '', renk: 'bolge', akis: false, secili: null };
const durumGrup = y => y.asama === 6 ? 'yayinda' : y.asama >= 1 ? 'hazirlik' : 'planli';
SAYFA.harita = {
  ciz(id) {
    const y = yegler();
    $('#hr').innerHTML = `
      <aside class="hr-sol">
        <div class="ust">
          <div class="etk">Genel harita</div>
          <h2>Türkiye'deki <em>${y.length} YEG</em></h2>
          <div class="ozet"><div><b>${yayinda().length}</b><span>yayında</span></div><div><b>${y.filter(x => x.asama >= 1 && x.asama < 6).length}</b><span>hazırlıkta</span></div><div><b>${y.filter(x => x.asama === 0).length}</b><span>planlandı</span></div></div>
          <div class="ara">${ik('ara', 17)}<input id="hrAra" placeholder="YEG, il veya ilçe ara…" value="${esc(HF.q)}"></div>
          <div class="chips" id="hrBolge"><button class="chip ${!HF.bolge ? 'on' : ''}" data-b="">Tümü</button>${BOLGE.map(b => `<button class="chip ${HF.bolge === b ? 'on' : ''}" data-b="${b}"><i style="background:${BOLGE_RENK[b]}"></i>${b.replace(' Anadolu', ' A.')}</button>`).join('')}</div>
          <div class="seg" id="hrDurum" style="margin-top:10px">${[['', 'Tümü'], ['yayinda', 'Yayında'], ['hazirlik', 'Hazırlıkta'], ['planli', 'Planlandı']].map(([k, l]) => `<button data-d="${k}" class="${HF.durum === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        </div>
        <div class="hr-liste" id="hrListe"></div>
      </aside>
      <div class="hr-harita" id="hrHarita">
        <div class="hr-ust">
          <div class="seg cam" id="hrRenk" style="padding:3px"><button data-r="bolge" class="${HF.renk === 'bolge' ? 'on' : ''}">Bölgeye göre</button><button data-r="asama" class="${HF.renk === 'asama' ? 'on' : ''}">İçerik aşaması</button></div>
          <div class="yatay"><button class="btn sm ${HF.akis ? 'gold' : 'ghost'}" id="hrAkis">${ik('parilti', 15)} YEGFEST'e akış</button><button class="btn sm ghost" id="hrAnkara">Ankara</button><button class="btn sm ghost" id="hrGenel">${ik('hedef', 15)} Genel</button></div>
        </div>
        <div class="hr-lej cam" id="hrLej"></div>
        <div class="hr-det" id="hrDet"></div>
      </div>`;
    $('#hrAra').oninput = e => { HF.q = e.target.value; hrListe(); hrFiltre(); };
    $$('#hrBolge .chip').forEach(b => b.onclick = () => { HF.bolge = b.dataset.b; $$('#hrBolge .chip').forEach(x => x.classList.toggle('on', x === b)); hrListe(); hrFiltre(); });
    $$('#hrDurum button').forEach(b => b.onclick = () => { HF.durum = b.dataset.d; $$('#hrDurum button').forEach(x => x.classList.toggle('on', x === b)); hrListe(); hrFiltre(); });
    $$('#hrRenk button').forEach(b => b.onclick = () => { HF.renk = b.dataset.r; $$('#hrRenk button').forEach(x => x.classList.toggle('on', x === b)); TR3?.renkModu(HF.renk); hrLejant(); });
    $('#hrAkis').onclick = e => { HF.akis = !HF.akis; e.currentTarget.className = 'btn sm ' + (HF.akis ? 'gold' : 'ghost'); TR3?.akis(HF.akis); if (HF.akis) TR3?.genel(); };
    $('#hrAnkara').onclick = () => TR3?.ankaraOdak();
    $('#hrGenel').onclick = () => { HF.secili = null; $('#hrDet').classList.remove('on'); TR3 && (TR3.secili = null); TR3?.genel(); hrListe(); };
    hrListe(); hrLejant();
    haritaKur($('#hrHarita'), { onSec: i => hrSec(i) }).then(t => {
      if (!t) return; t.o.etiket = true; t.akis(HF.akis); t.renkModu(HF.renk); hrFiltre();
      if (id && yeg(id)) setTimeout(() => hrSec(id), 300); else if (!YUMUSAK) t.genel();
    });
  }
};
function hrUygun(y) {
  const q = HF.q.toLocaleLowerCase('tr');
  return (!HF.bolge || y.bolge === HF.bolge) && (!HF.durum || durumGrup(y) === HF.durum) && (!q || [y.ad, y.il, y.ilce, y.urun].join(' ').toLocaleLowerCase('tr').includes(q));
}
function hrFiltre() { const tum = !HF.q && !HF.bolge && !HF.durum; TR3?.filtre(tum ? null : hrUygun); }
function hrListe() {
  const l = yegler().filter(hrUygun).sort((a, b) => (b.pilot - a.pilot) || (b.asama - a.asama) || a.ad.localeCompare(b.ad, 'tr'));
  $('#hrListe').innerHTML = l.length ? l.map(y => `<div class="hl ${HF.secili === y.id ? 'on' : ''}" data-id="${y.id}"><div class="r" style="background:${y.pilot ? `linear-gradient(150deg,${D[y.id].c},${D[y.id].c2})` : BOLGE_RENK[y.bolge]}">${y.pilot ? D[y.id].emoji : BOLGE_KISA[y.bolge]}</div>
    <div style="min-width:0;flex:1"><b>${esc(y.ad)} ${y.temsili ? '<span class="temsili">temsilî</span>' : ''}</b><span>${esc(y.il)} · ${esc(y.bolge)}</span></div>
    <span class="pill" style="color:${ASAMA_RENK[y.asama]};background:${ASAMA_RENK[y.asama]}1A">${ASAMA[y.asama]}</span></div>`).join('') : '<div class="bos-not">Sonuç yok</div>';
  $$('#hrListe .hl').forEach(e => e.onclick = () => hrSec(e.dataset.id));
}
function hrLejant() {
  $('#hrLej').innerHTML = HF.renk === 'bolge'
    ? BOLGE.map(b => `<span><i style="background:${BOLGE_RENK[b]}"></i>${b}</span>`).join('') + `<span><i style="background:#E3B341;box-shadow:0 0 0 2px #fff3"></i>Pilot (yayında)</span>`
    : ASAMA.map((a, i) => `<span><i style="background:${ASAMA_RENK[i]}"></i>${a}</span>`).join('');
}
function hrSec(id) {
  const y = yeg(id); if (!y) return; HF.secili = id;
  TR3?.sec(id); TR3?.odak(id, y.pilot ? 6 : 5);
  $$('#hrListe .hl').forEach(e => e.classList.toggle('on', e.dataset.id === id));
  $(`#hrListe .hl[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  const d = y.pilot ? D[y.id] : null, st = yegStant(id);
  const kap = d ? `linear-gradient(150deg,${d.c},${d.c2})` : `linear-gradient(150deg,${BOLGE_RENK[y.bolge]},#14263F)`;
  $('#hrDet').innerHTML = `<div class="kap" style="background:${kap}"><div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.85">${esc(y.il)} · ${esc(y.bolge)}</div><h3>${d ? d.emoji + ' ' : ''}${esc(y.ad)}</h3><button class="kapat" id="hrKapat">✕</button></div>
    <div class="gov">
      ${d ? `<p style="font-size:14px;color:var(--muted)">${esc(d.tl)} · ${d.chips.join(', ')}</p>` : `<p style="font-size:13.5px;color:var(--muted)">${y.temsili ? 'Temsilî kayıt: gerçek YEG listesi yüklendiğinde ad ve konum güncellenir.' : esc(y.ilce || '')}</p>`}
      <div class="asama-bar">${ASAMA.map((a, i) => `<i style="background:${i <= y.asama ? ASAMA_RENK[y.asama] : ''}"></i>`).join('')}</div>
      <div style="font-size:13px"><b style="color:${ASAMA_RENK[y.asama]}">${ASAMA[y.asama]}</b> · Festival stantı: <b>${st || '—'}</b></div>
      <div class="yatay" style="margin-top:14px">
        ${d ? `<button class="btn sm gold" onclick="openFull('${y.id}')">İlçe sayfası</button>` : ''}
        ${st ? `<button class="btn sm" onclick="salondaGoster('${y.id}')">${ik('salon', 14)} Salonda göster</button>` : ''}
        <button class="btn sm ghost" onclick="git('yonetim/yegler');setTimeout(()=>yegCekmece('${y.id}'),400)">Yönet</button>
      </div>
    </div>`;
  $('#hrDet').classList.add('on'); $('#hrKapat').onclick = () => { $('#hrDet').classList.remove('on'); HF.secili = null; if (TR3) TR3.secili = null; hrListe(); };
}
function salondaGoster(id) {
  git('salon');
  setTimeout(() => { const y = yeg(id); if (y?.pilot) { slCur = ORDER.indexOf(id); slYakin = false; FUAR?.odakPilot(id); slBilgi(); } else { const s = yegStant(id), sl = PLAN.slotlar.find(x => x.id === s); if (sl) { FUAR?.odakSlot(s); FUAR?.stantVurgula(s); slSlotBilgi(sl); } } }, 900);
}
