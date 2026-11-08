/* =====================================================================
   FESTİVAL SALONU — ziyaretçi arayüzü (3D)
===================================================================== */
let slCur = -1, slYakin = false;
SAYFA.salon = {
  ciz() {
    const kap = $('#salon3d');
    if (!kap.dataset.kuruldu) {
      kap.innerHTML = `
        <div class="sl-ust cam" id="slUst">Bir standa tıklayın · ← → ile pilot stantlar arasında gezinin</div>
        <div class="sl-sol cam gizli" id="slSol"></div>
        <div class="minimap cam" id="miniHarita"><div class="bas"><span>Salon planı</span><span id="miniNot">tıklayarak gidin</span></div>${planSVG({ mini: true })}</div>
        <div class="sl-bolge cam" id="slBolge"><div class="etk" style="margin:2px 4px 4px">Bölge alanları</div>${BOLGE.map(b => `<button class="chip" data-b="${b}"><i style="background:${BOLGE_RENK[b]}"></i>${b}</button>`).join('')}</div>
        <div class="sl-alt">
          <button class="nav-arrow" id="slOnce" title="Önceki pilot stant">←</button>
          <button class="btn ghost" id="slGenel">${ik('hedef', 16)} Genel bakış</button>
          <button class="btn gold" id="slTur">${ik('parilti', 16)} Sinematik tur</button>
          <button class="btn ghost" id="slPilot">${ik('salon', 16)} Pilot meydanı</button>
          <button class="nav-arrow" id="slSonra" title="Sonraki pilot stant">→</button>
        </div>`;
      kap.dataset.kuruldu = 1;
      $('#slOnce').onclick = () => slGit(slCur <= 0 ? 2 : slCur - 1);
      $('#slSonra').onclick = () => slGit(slCur >= 2 ? 0 : slCur + 1);
      $('#slGenel').onclick = () => { slCur = -1; slYakin = false; FUAR?.genel(); slBilgi(); };
      $('#slTur').onclick = () => { FUAR?.tur(); slBilgi(); toast('Sinematik tur başladı · durdurmak için salonu sürükleyin'); };
      $('#slPilot').onclick = () => { slCur = -1; FUAR?.odakNokta(9.2, 8); slBilgi(); };
      $$('#slBolge [data-b]').forEach(b => b.onclick = () => { $$('#slBolge .chip').forEach(x => x.classList.toggle('on', x === b)); FUAR?.odakBolge(b.dataset.b); });
      $('#miniHarita svg').addEventListener('click', e => { const p = svgNokta(e); if (p) FUAR?.odakNokta(p.x, p.z); });
    } else { $('#miniHarita').innerHTML = `<div class="bas"><span>Salon planı</span><span>tıklayarak gidin</span></div>${planSVG({ mini: true })}`; $('#miniHarita svg').addEventListener('click', e => { const p = svgNokta(e); if (p) FUAR?.odakNokta(p.x, p.z); }); }
    fuarKur(kap, {
      zoom: true,
      onPilot: k => { slCur = ORDER.indexOf(k); slYakin = false; slBilgi(); },
      onSlot: sl => slSlotBilgi(sl),
      onKamera: (p, t) => { const m = $('#miniKam'); if (m) { m.setAttribute('cx', t.x); m.setAttribute('cy', t.z); } const g = $('#miniGoz'); if (g) { g.setAttribute('x1', p.x); g.setAttribute('y1', p.z); g.setAttribute('x2', t.x); g.setAttribute('y2', t.z); } }
    }).then(f => { if (f && !YUMUSAK) { slCur = -1; slYakin = false; f.genel(); slBilgi(); } });
  }
};
function slGit(i) { slCur = i; slYakin = false; FUAR?.odakPilot(ORDER[i]); slBilgi(); }
function slBilgi() {
  const el = $('#slSol'); if (!el) return;
  if (slCur < 0) { el.classList.add('gizli'); $('#slUst').textContent = 'Bir standa tıklayın · ← → ile pilot stantlar arasında gezinin'; return; }
  const k = ORDER[slCur], d = D[k];
  el.classList.remove('gizli');
  el.innerHTML = `<div class="etk">Pilot stant ${slCur + 1} / 3 · ${d.bolge}</div><h3>${d.emoji} ${d.name}</h3><p>${d.tl}. ${slYakin ? 'Standın önündesiniz; QR kodu okutun, ilçenin hikâyesini dinleyin.' : 'Standa yaklaşarak ürünleri ve QR panosunu görün.'}</p>
    <div class="row">${slYakin ? `<button class="btn gold sm" id="slOkut">📱 QR'ı okut</button>` : `<button class="btn sm" id="slYaklas">Standa yaklaş</button>`}
    ${stamps.has(k) ? '<span class="btn ghost sm" style="cursor:default">✓ Damga alındı</span>' : ''}<button class="btn ghost sm" id="slSayfa">İlçe sayfası</button></div>`;
  $('#slUst').textContent = slYakin ? `QR panosuna bakıyorsunuz · “QR'ı okut”a basın` : 'Standa yaklaşmak için “Standa yaklaş”';
  const y = $('#slYaklas'); if (y) y.onclick = () => { slYakin = true; FUAR?.odakPilot(k, true); slBilgi(); };
  const o = $('#slOkut'); if (o) o.onclick = () => openPhone(k);
  $('#slSayfa').onclick = () => openFull(k);
}
function slSlotBilgi(sl) {
  const el = $('#slSol'), y = stantYeg(sl.id); slCur = -1; el.classList.remove('gizli');
  el.innerHTML = y ? `<div class="etk">Stant ${sl.id} · ${sl.bolge}</div><h3><span style="width:12px;height:12px;border-radius:50%;background:${BOLGE_RENK[sl.bolge]}"></span>${esc(y.ad)}</h3>
    <p>${esc(y.il)}${y.ilce ? ' · ' + esc(y.ilce) : ''} · ${y.temsili ? 'Temsilî kayıt' : 'YEG'}</p>
    <div class="asama">${ASAMA.map((a, i) => `<i style="background:${i <= y.asama ? ASAMA_RENK[y.asama] : ''}"></i>`).join('')}</div>
    <p style="margin-top:6px">İlçe sayfası: <b style="color:#fff">${ASAMA[y.asama]}</b>${y.asama < 6 ? ' · yayına girince QR ile açılacak' : ''}</p>
    <div class="row"><button class="btn ghost sm" onclick="git('harita/${y.id}')">${ik('harita', 14)} Haritada gör</button></div>`
    : `<div class="etk">Stant ${sl.id} · ${sl.bolge}</div><h3>Boş stant</h3><p>Bu stanta henüz YEG yerleştirilmedi. Yerleşim Yönetim › Stant yerleşimi'nden yapılır.</p><div class="row"><button class="btn ghost sm" onclick="git('yonetim/stant')">Stant yerleşimini aç</button></div>`;
  $('#slUst').textContent = sl.id + ' · ' + sl.bolge;
}
window.salonDamga = () => slBilgi();
window.salonTelefonKapandi = () => slBilgi();
addEventListener('keydown', e => {
  if (!$('#v-salon').classList.contains('on') || $('#phoneWrap').classList.contains('on')) return;
  if (e.key === 'ArrowRight') $('#slSonra').click(); else if (e.key === 'ArrowLeft') $('#slOnce').click(); else if (e.key === 'Escape') $('#slGenel').click();
  else if (e.key === 'Enter' && slCur >= 0) { if (!slYakin) $('#slYaklas')?.click(); else openPhone(ORDER[slCur]); }
});

/* Salon planı SVG (ziyaretçi mini harita + yönetim paneli) */
function planSVG({ mini = false, secili = null, hedefler = [] } = {}) {
  const { x0, x1, z0, z1 } = PLAN.sinir, pad = 2, W = x1 - x0 + pad * 2, H = z1 - z0 + pad * 2 + 4;
  let s = `<svg viewBox="${x0 - pad} ${z0 - pad - 4} ${W} ${H}" data-x0="${x0 - pad}" data-z0="${z0 - pad - 4}" data-w="${W}" data-h="${H}">`;
  s += `<rect x="${x0 - pad}" y="${z0 - pad - 4}" width="${W}" height="${H}" fill="${mini ? '#1B3152' : '#F6F2E8'}" rx="2"/>`;
  s += `<rect x="${x0}" y="-11.5" width="${x1 - x0}" height="9" fill="${mini ? '#26406A' : '#ECE3CE'}" rx="1"/>`;
  PLAN.alanlar.forEach(a => { s += `<rect x="${a.x}" y="${a.z}" width="${a.w}" height="${a.d}" rx="1" fill="${a.renk}" opacity="${mini ? .35 : .14}"/>`; if (!mini) s += `<text x="${a.x + .6}" y="${a.z - .6}" font-size="1.7" font-weight="800" fill="${a.renk}">${a.bolge}</text>`; });
  PLAN.slotlar.forEach(sl => {
    const y = stantYeg(sl.id), c = y ? BOLGE_RENK[sl.bolge] : (mini ? '#5B6B82' : '#D8D2C4');
    s += `<g class="sl ${sl.id === secili ? 'sec' : ''} ${hedefler.includes(sl.id) ? 'hedef' : ''}" data-s="${sl.id}"><rect x="${sl.x - 1.25}" y="${sl.z - 1.1}" width="2.5" height="2.2" rx=".25" fill="${c}" opacity="${y ? 1 : .8}"/>${!mini && y ? `<text x="${sl.x}" y="${sl.z + .45}" font-size=".95" text-anchor="middle" fill="#fff" font-weight="800">${y.ad.replace('YEG ', '')}</text>` : ''}</g>`;
  });
  PLAN.pilot.forEach(p => { const d = D[p.k]; s += `<g class="sl pilot" data-p="${p.k}"><rect x="${p.x - 2.4}" y="${p.z - 1.9}" width="4.8" height="3.8" rx=".4" fill="${d.c}" stroke="#E3B341" stroke-width=".35"/>${mini ? '' : `<text x="${p.x}" y="${p.z + .5}" font-size="1.2" text-anchor="middle" fill="#fff" font-weight="800">${d.name}</text>`}</g>`; });
  const sh = PLAN.sahne; s += `<rect x="${sh.x - sh.w / 2}" y="${sh.z - sh.d / 2}" width="${sh.w}" height="${sh.d}" fill="#14263F" rx=".6"/><text x="${sh.x}" y="${sh.z + .6}" font-size="1.6" text-anchor="middle" fill="#E3B341" font-weight="800">SAHNE</text>`;
  if (!mini) s += `<text x="-12" y="-6.4" font-size="1.4" text-anchor="middle" fill="#1F3A5F" font-weight="800">BİLGİ</text><text x="29.5" y="-6.4" font-size="1.4" text-anchor="middle" fill="#5E8C4A" font-weight="800">TADIM</text>`;
  s += `<rect x="${x0}" y="${z0 - 4.5}" width="${x1 - x0}" height="1.2" fill="#14263F" rx=".4"/>`;
  if (mini) s += `<line id="miniGoz" x1="0" y1="0" x2="0" y2="0" stroke="#E3B341" stroke-width=".5" opacity=".7"/><circle id="miniKam" cx="0" cy="0" r="1.6" fill="#E3B341" stroke="#fff" stroke-width=".4"/>`;
  return s + '</svg>';
}
function svgNokta(e) {
  const sv = e.currentTarget.closest ? e.currentTarget.closest('svg') : e.target.closest('svg'); if (!sv) return null;
  const r = sv.getBoundingClientRect(), x0 = +sv.dataset.x0, z0 = +sv.dataset.z0, w = +sv.dataset.w, h = +sv.dataset.h;
  const k = Math.min(r.width / w, r.height / h), ox = (r.width - w * k) / 2, oy = (r.height - h * k) / 2;
  return { x: x0 + (e.clientX - r.left - ox) / k, z: z0 + (e.clientY - r.top - oy) / k };
}
