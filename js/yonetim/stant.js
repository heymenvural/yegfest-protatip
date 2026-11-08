/* =====================================================================
   Yönetim › Stant yerleşimi (plan + 3D önizleme)
===================================================================== */
let stSecili = null, stTakas = false;
YON.stant = {
  ciz() {
    const dolu = Object.values(S.stant).filter(Boolean).length;
    return yKafa('', 'Stant <em>yerleşimi</em>', `${PLAN.slotlar.length} bölge stantı + ${PLAN.pilot.length} pilot stant · ${dolu} dolu. Plandan bir stant seçin; YEG atayın, takas edin ya da boşaltın.`,
      `<button class="btn sm ghost" id="stBosalt">Tümünü boşalt</button><button class="btn sm gold" id="stOto">${ik('parilti', 15)} Bölgeye göre otomatik yerleştir</button>`) + `
    <div class="ig ig-a">
      <div class="ig" style="align-content:start">
        <div class="kart pad"><div class="yatay" style="justify-content:space-between;margin-bottom:10px"><h3>Salon planı</h3><div class="yatay" style="font-size:11.5px;color:var(--muted);gap:12px">${BOLGE.map(b => `<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${BOLGE_RENK[b]};margin-right:4px"></i>${BOLGE_KISA[b]}</span>`).join('')}<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:#D8D2C4;margin-right:4px"></i>Boş</span></div></div>
          <div class="plan" id="stPlan"></div></div>
        <div class="kart pad"><div class="yatay" style="justify-content:space-between;margin-bottom:10px"><div><h3>3D önizleme</h3><div class="alt-b">Seçtiğiniz stant salonda vurgulanır</div></div><button class="btn sm ghost" onclick="git('salon')">${ik('salon', 14)} Ziyaretçi görünümü</button></div><div class="plan3d" id="stUc"></div></div>
      </div>
      <div class="ig" style="align-content:start">
        <div class="kart pad" id="stDetay"></div>
        <div class="kart pad"><h3>Bölge doluluğu</h3><div id="stDoluluk" style="margin-top:8px"></div></div>
        <div class="kart pad"><div class="yatay" style="justify-content:space-between"><h3>Yerleşmemiş YEG'ler</h3><span class="pill" style="color:var(--blue);background:#2E78C71A" id="stBosSay"></span></div><div class="ys-l" id="stBos" style="margin-top:8px"></div></div>
      </div>
    </div>`;
  },
  sonra() {
    stCiz();
    $('#stOto').onclick = () => {
      S.stant = varsayilanYerlesim(); kaydet(); stCiz(); FUAR?.yerlesimGuncelle(); yonetimOlay('stant', 'Stantlar bölgelere göre otomatik yerleştirildi');
      $$('#stPlan .sl:not(.pilot) rect').forEach((r, i) => { r.style.opacity = 0; setTimeout(() => { r.style.transition = 'opacity .3s'; r.style.opacity = 1; }, i * 6); });
      toast('✓ Stantlar bölgelere göre yerleştirildi');
    };
    $('#stBosalt').onclick = () => { if (!confirm('Tüm bölge stantları boşaltılsın mı?')) return; S.stant = {}; kaydet(); stCiz(); FUAR?.yerlesimGuncelle(); yonetimOlay('stant', 'Tüm bölge stantları boşaltıldı'); };
    fuarKur($('#stUc'), { zoom: true, onSlot: sl => stSec(sl.id, false), onPilot: k => { stSecili = null; stCiz(); }, onKamera: null }).then(f => { if (f) stSecili ? f.odakSlot(stSecili) : f.genel(); });
  }
};
function stCiz() {
  $('#stPlan').innerHTML = planSVG({ secili: stSecili });
  $$('#stPlan .sl').forEach(g => g.onclick = () => { if (g.dataset.p) { FUAR?.odakPilot(g.dataset.p); return; } stSec(g.dataset.s); });
  // detay
  const sl = PLAN.slotlar.find(x => x.id === stSecili), y = sl ? stantYeg(sl.id) : null;
  const bos = yegler().filter(x => !x.pilot && !yegStant(x.id));
  $('#stDetay').innerHTML = !sl ? `<h3>Stant seçin</h3><p class="alt-b" style="margin-top:6px">Plandaki ya da 3D önizlemedeki bir stanta tıklayın. Pilot stantlar sabittir.</p>` : `
    <div class="etk">${sl.id} · ${sl.bolge}</div>
    <h3 style="font-size:20px;margin:4px 0 10px">${y ? esc(y.ad) : 'Boş stant'}</h3>
    ${y ? `<div style="font-size:13px;color:var(--muted);margin-bottom:10px">${esc(y.il)}${y.ilce ? ' · ' + esc(y.ilce) : ''} · <b style="color:${ASAMA_RENK[y.asama]}">${ASAMA[y.asama]}</b>${y.bolge !== sl.bolge ? ` · <b style="color:var(--red)">farklı bölge (${y.bolge})</b>` : ''}</div>` : ''}
    <label class="alan">YEG ata<select id="stAta"><option value="">— Boş bırak —</option>${y ? `<option value="${y.id}" selected>${esc(y.ad)} (mevcut)</option>` : ''}<optgroup label="${sl.bolge} · yerleşmemiş">${bos.filter(x => x.bolge === sl.bolge).map(x => `<option value="${x.id}">${esc(x.ad)} · ${esc(x.il)}</option>`).join('')}</optgroup><optgroup label="Diğer bölgeler">${bos.filter(x => x.bolge !== sl.bolge).map(x => `<option value="${x.id}">${esc(x.ad)} · ${esc(x.bolge)}</option>`).join('')}</optgroup></select></label>
    <div class="yatay"><button class="btn sm gold" id="stUygula">Uygula</button><button class="btn sm ${stTakas ? '' : 'ghost'}" id="stTakasB">${stTakas ? 'Takas için stant seçin…' : '⇄ Takas et'}</button>${y ? `<button class="btn sm ghost" onclick="git('harita/${y.id}')">${ik('harita', 14)}</button>` : ''}</div>`;
  if (sl) {
    $('#stUygula').onclick = () => { const v = $('#stAta').value; if (v) { Object.keys(S.stant).forEach(k => { if (S.stant[k] === v) delete S.stant[k]; }); S.stant[sl.id] = v; } else delete S.stant[sl.id]; kaydet(); FUAR?.yerlesimGuncelle(); FUAR?.stantVurgula(sl.id); stCiz(); yonetimOlay('stant', v ? `<b>${esc(yeg(v).ad)}</b> → stant <b>${sl.id}</b>` : `Stant <b>${sl.id}</b> boşaltıldı`); toast('✓ Yerleşim güncellendi'); };
    $('#stTakasB').onclick = () => { stTakas = !stTakas; stCiz(); };
  }
  // doluluk
  $('#stDoluluk').innerHTML = BOLGE.map(b => { const s = PLAN.slotlar.filter(x => x.bolge === b), d = s.filter(x => S.stant[x.id]).length; return `<div class="bolge-sat" style="grid-template-columns:120px 1fr 56px"><b>${b}</b><div class="yigin"><i style="width:${d / s.length * 100}%;background:${BOLGE_RENK[b]}"></i></div><span style="text-align:right;font-size:12.5px;font-weight:800">${d}/${s.length}</span></div>`; }).join('');
  $('#stBosSay').textContent = bos.length;
  $('#stBos').innerHTML = bos.length ? bos.map(x => `<div class="ys" data-id="${x.id}"><span class="r" style="background:${BOLGE_RENK[x.bolge]}"></span><div style="flex:1;min-width:0"><b style="color:var(--navy)">${esc(x.ad)}</b> <span style="color:var(--muted)">· ${esc(x.il)}</span></div><span style="font-size:11px;color:var(--muted)">${BOLGE_KISA[x.bolge]}</span></div>`).join('') : '<div class="bos-not">Bütün YEG\'ler yerleşti.</div>';
  $$('#stBos .ys').forEach(e => e.onclick = () => {
    const y = yeg(e.dataset.id), hedef = PLAN.slotlar.find(s => s.bolge === y.bolge && !S.stant[s.id]) || PLAN.slotlar.find(s => !S.stant[s.id]);
    if (!hedef) { toast('Boş stant kalmadı'); return; }
    S.stant[hedef.id] = y.id; kaydet(); stSecili = hedef.id; FUAR?.yerlesimGuncelle(); FUAR?.odakSlot(hedef.id); FUAR?.stantVurgula(hedef.id); stCiz(); yonetimOlay('stant', `<b>${esc(y.ad)}</b> → stant <b>${hedef.id}</b>`);
  });
}
function stSec(id, uc = true) {
  if (stTakas && stSecili && id !== stSecili) {
    const a = S.stant[stSecili], b = S.stant[id]; if (b) S.stant[stSecili] = b; else delete S.stant[stSecili]; if (a) S.stant[id] = a; else delete S.stant[id];
    kaydet(); FUAR?.yerlesimGuncelle(); FUAR?.stantVurgula(id); FUAR?.stantVurgula(stSecili); yonetimOlay('stant', `Stant <b>${stSecili}</b> ⇄ <b>${id}</b> takas edildi`); toast('⇄ Takas edildi'); stTakas = false;
  }
  stSecili = id; if (uc) FUAR?.odakSlot(id); else FUAR && (FUAR.seciliSlot = id, FUAR.renkle()); stCiz();
}
