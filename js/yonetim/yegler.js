/* =====================================================================
   Yönetim › YEG'ler (tablo, düzenleme, CSV içe/dışa aktarma)
===================================================================== */
const YT = { q: '', bolge: '', asama: '', sira: 'ad', yon: 1, sayfa: 0 };
YON.yegler = {
  ciz() {
    const y = yegler();
    return yKafa('', "YEG'ler", `${y.length} kayıt · ${y.filter(x => x.temsili).length} temsilî. Gerçek listeyi CSV ile yükleyebilir ya da tek tek ekleyebilirsiniz.`,
      `<button class="btn sm ghost" id="ytSablon">${ik('indir', 15)} CSV şablonu</button><button class="btn sm ghost" id="ytDisa">${ik('indir', 15)} Dışa aktar</button><button class="btn sm" id="ytIce">${ik('yukle', 15)} CSV içe aktar</button><button class="btn sm gold" id="ytYeni">${ik('arti', 15)} Yeni YEG</button>`) + `
    <div class="kart pad">
      <div class="tablo-ust">
        <div class="ara">${ik('ara', 17)}<input id="ytAra" placeholder="Ad, il veya ilçe ara…" value="${esc(YT.q)}"></div>
        <select class="f" id="ytBolge"><option value="">Tüm bölgeler</option>${BOLGE.map(b => `<option ${YT.bolge === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
        <select class="f" id="ytAsama"><option value="">Tüm aşamalar</option>${ASAMA.map((a, i) => `<option value="${i}" ${YT.asama === String(i) ? 'selected' : ''}>${a}</option>`).join('')}</select>
      </div>
      <div class="tablo-kap"><table class="tablo"><thead><tr>${[['ad', 'YEG'], ['il', 'İl'], ['ilce', 'İlçe'], ['bolge', 'Bölge'], ['asama', 'İçerik aşaması'], ['stant', 'Stant']].map(([k, l]) => `<th data-s="${k}">${l}${YT.sira === k ? (YT.yon > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody id="ytGovde"></tbody></table></div>
      <div class="sayfala" id="ytSayfa"></div>
    </div>`;
  },
  sonra() {
    ytCiz();
    $('#ytAra').oninput = e => { YT.q = e.target.value; YT.sayfa = 0; ytCiz(); };
    $('#ytBolge').onchange = e => { YT.bolge = e.target.value; YT.sayfa = 0; ytCiz(); };
    $('#ytAsama').onchange = e => { YT.asama = e.target.value; YT.sayfa = 0; ytCiz(); };
    $$('.tablo th').forEach(th => th.onclick = () => { const s = th.dataset.s; YT.yon = YT.sira === s ? -YT.yon : 1; YT.sira = s; SAYFA.yonetim.ciz('yegler'); });
    $('#ytYeni').onclick = () => yegCekmece(null);
    $('#ytIce').onclick = csvModal;
    $('#ytSablon').onclick = () => indir('yegfest-yeg-sablon.csv', 'ad;il;ilce;enlem;boylam;asama\nÖrnek YEG;Aydın;Buharkent;37.97;28.75;Planlandı\n');
    $('#ytDisa').onclick = () => indir('yegfest-yegler.csv', 'ad;il;ilce;bolge;enlem;boylam;asama;stant;temsili\n' + yegler().map(y => [y.ad, y.il, y.ilce, y.bolge, y.lat, y.lon, ASAMA[y.asama], yegStant(y.id) || '', y.temsili ? 'evet' : 'hayır'].join(';')).join('\n'));
  }
};
function ytListe() {
  const q = YT.q.toLocaleLowerCase('tr');
  return yegler().filter(y => (!YT.bolge || y.bolge === YT.bolge) && (YT.asama === '' || y.asama === +YT.asama) && (!q || [y.ad, y.il, y.ilce].join(' ').toLocaleLowerCase('tr').includes(q)))
    .sort((a, b) => { const k = YT.sira; const va = k === 'stant' ? (yegStant(a.id) || 'ZZ') : a[k], vb = k === 'stant' ? (yegStant(b.id) || 'ZZ') : b[k]; return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'tr')) * YT.yon; });
}
function ytCiz() {
  const l = ytListe(), N = 20, top = Math.ceil(l.length / N) || 1; YT.sayfa = Math.min(YT.sayfa, top - 1);
  $('#ytGovde').innerHTML = l.slice(YT.sayfa * N, YT.sayfa * N + N).map(y => `<tr class="sat" data-id="${y.id}">
    <td><b style="color:var(--navy)">${y.pilot ? D[y.id].emoji + ' ' : ''}${esc(y.ad)}</b> ${y.temsili ? '<span class="temsili">temsilî</span>' : ''}${y.pilot ? '<span class="temsili" style="background:#FBF3D9;color:#8A6D10">pilot</span>' : ''}</td>
    <td>${esc(y.il)}</td><td>${esc(y.ilce || '—')}</td><td><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${BOLGE_RENK[y.bolge]};margin-right:6px"></span>${esc(y.bolge)}</td>
    <td><span class="pill" style="color:${ASAMA_RENK[y.asama]};background:${ASAMA_RENK[y.asama]}1A">${ASAMA[y.asama]}</span></td><td>${yegStant(y.id) || '<span style="color:var(--dim)">—</span>'}</td></tr>`).join('') || `<tr><td colspan="6" class="bos-not">Sonuç yok</td></tr>`;
  $$('#ytGovde tr.sat').forEach(t => t.onclick = () => yegCekmece(t.dataset.id));
  $('#ytSayfa').innerHTML = `<span>${l.length} kayıttan ${l.length ? YT.sayfa * N + 1 : 0}–${Math.min(l.length, YT.sayfa * N + N)}</span><div class="yatay"><button class="btn sm ghost" ${YT.sayfa ? '' : 'disabled style="opacity:.4"'} id="ytOnce">←</button><span>${YT.sayfa + 1} / ${top}</span><button class="btn sm ghost" ${YT.sayfa < top - 1 ? '' : 'disabled style="opacity:.4"'} id="ytSonra">→</button></div>`;
  $('#ytOnce').onclick = () => { YT.sayfa--; ytCiz(); }; $('#ytSonra').onclick = () => { YT.sayfa++; ytCiz(); };
}
function yegCekmece(id) {
  const y = id ? yeg(id) : { id: null, ad: '', il: 'Ankara', ilce: '', bolge: 'İç Anadolu', lat: '', lon: '', asama: 0, temsili: false };
  const ilceSec = il => (ILCELER[il] || []).map(i => `<option ${i === y.ilce ? 'selected' : ''}>${i}</option>`).join('');
  cekmece(`<div class="cb"><div><div class="etk">${id ? (y.temsili ? 'Temsilî kayıt' : 'YEG kaydı') : 'Yeni kayıt'}</div><h3 style="font-size:20px;color:var(--navy);margin-top:4px">${id ? esc(y.ad) : "Yeni YEG"}</h3></div><button class="kapat-b" data-kapat>✕</button></div>
    <div class="cg">
      <label class="alan">YEG adı<input id="yfAd" value="${esc(y.ad)}" placeholder="ör. Buharkent Yerel Eylem Grubu" ${y.pilot ? 'disabled' : ''}></label>
      <div class="ig ig2" style="gap:10px"><label class="alan">İl<select id="yfIl">${TRV.iller.map(i => i[0]).sort((a, b) => a.localeCompare(b, 'tr')).map(i => `<option ${i === y.il ? 'selected' : ''}>${i}</option>`).join('')}</select></label>
      <label class="alan">İlçe<select id="yfIlce"><option value="">—</option>${ilceSec(y.il)}</select></label></div>
      <label class="alan">Bölge <small>ilden otomatik</small><input id="yfBolge" value="${esc(y.bolge)}" disabled></label>
      <div class="ig ig2" style="gap:10px"><label class="alan">Enlem<input id="yfLat" value="${y.lat}" placeholder="boşsa il merkezi"></label><label class="alan">Boylam<input id="yfLon" value="${y.lon}" placeholder="boşsa il merkezi"></label></div>
      <label class="alan">İçerik aşaması<select id="yfAsama">${ASAMA.map((a, i) => `<option value="${i}" ${i === y.asama ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
      ${id ? `<div style="font-size:13px;color:var(--muted);margin-top:4px">Festival stantı: <b style="color:var(--navy)">${yegStant(id) || '—'}</b></div>` : ''}
      ${id ? `<div class="yatay" style="margin-top:14px"><button class="btn sm ghost" onclick="git('harita/${id}')">${ik('harita', 14)} Haritada</button>${yegStant(id) ? `<button class="btn sm ghost" onclick="cekmeceKapat();salondaGoster('${id}')">${ik('salon', 14)} Salonda</button>` : ''}${y.pilot ? `<button class="btn sm ghost" onclick="cekmeceKapat();openFull('${id}')">İlçe sayfası</button>` : ''}</div>` : ''}
    </div>
    <div class="ca">${id && !y.pilot ? `<button class="btn sm ghost" id="yfSil" style="color:var(--red);margin-right:auto">Sil</button>` : ''}<button class="btn sm ghost" data-kapat>Vazgeç</button><button class="btn sm gold" id="yfKaydet">Kaydet</button></div>`);
  $('#yfIl').onchange = e => { $('#yfIlce').innerHTML = '<option value="">—</option>' + (ILCELER[e.target.value] || []).map(i => `<option>${i}</option>`).join(''); $('#yfBolge').value = ilBolge(e.target.value) || ''; };
  $('#yfKaydet').onclick = () => {
    const il = $('#yfIl').value, k = ilKonum(il), lat = parseFloat($('#yfLat').value), lon = parseFloat($('#yfLon').value);
    const v = { ad: y.pilot ? y.ad : ($('#yfAd').value.trim() || 'Adsız YEG'), il, ilce: $('#yfIlce').value, bolge: ilBolge(il) || y.bolge, lat: isFinite(lat) ? lat : (y.lat && y.il === il ? y.lat : k[1] + (Math.random() - .5) * .3), lon: isFinite(lon) ? lon : (y.lon && y.il === il ? y.lon : k[0] + (Math.random() - .5) * .4), asama: +$('#yfAsama').value };
    if (id) { Object.assign(yeg(id), v, { temsili: y.temsili && v.ad === y.ad && v.il === y.il }); yonetimOlay('yeg', `<b>${esc(v.ad)}</b> kaydı güncellendi`); }
    else { const n = { id: 'u' + Date.now(), ...v, pilot: false, temsili: false, urun: '' }; S.yegler.push(n); yonetimOlay('yeg', `<b>${esc(v.ad)}</b> eklendi`); }
    kaydet(); haritalariGuncelle(); cekmeceKapat(); toast('✓ Kaydedildi'); if (yonModul === 'yegler') ytCiz();
  };
  const sil = $('#yfSil'); if (sil) sil.onclick = () => { if (!confirm(`${y.ad} silinsin mi?`)) return; S.yegler = S.yegler.filter(x => x.id !== id); Object.keys(S.stant).forEach(k => { if (S.stant[k] === id) delete S.stant[k]; }); kaydet(); haritalariGuncelle(); cekmeceKapat(); ytCiz(); yonetimOlay('yeg', `<b>${esc(y.ad)}</b> silindi`); };
}
function csvModal() {
  const m = modal({ baslik: 'CSV ile YEG listesi yükle', govde: `
    <p style="font-size:13.5px;color:var(--muted);margin-bottom:10px">Sütunlar: <b>ad; il; ilce; enlem; boylam; asama</b>. Yalnızca <b>ad</b> ve <b>il</b> zorunludur; konum yoksa il merkezi kullanılır. Ayırıcı noktalı virgül veya virgül olabilir.</p>
    <label class="alan">Dosya<input type="file" id="csvDos" accept=".csv,.txt"></label>
    <label class="alan">veya yapıştırın<textarea id="csvMetin" placeholder="ad;il;ilce;enlem;boylam;asama&#10;Örnek YEG;Aydın;Buharkent;37.97;28.75;Planlandı"></textarea></label>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;margin-top:4px"><input type="checkbox" id="csvDegis" checked> Temsilî kayıtları kaldır, listeyi bununla değiştir</label>
    <div id="csvOn" style="font-size:13px;color:var(--muted);margin-top:10px"></div>`,
    eylem: `<button class="btn ghost sm" data-k>Vazgeç</button><button class="btn gold sm" id="csvYukle">İçe aktar</button>` });
  const on = () => { const l = csvAyristir($('#csvMetin', m.el).value); const ok = l.filter(r => r.ad && ilKonum(r.il)); $('#csvOn', m.el).innerHTML = l.length ? `<b style="color:var(--navy)">${ok.length}</b> geçerli satır${l.length - ok.length ? ` · <span style="color:var(--red)">${l.length - ok.length} satırda il bulunamadı</span>` : ''}` : ''; };
  $('#csvMetin', m.el).oninput = on;
  $('#csvDos', m.el).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $('#csvMetin', m.el).value = r.result; on(); }; r.readAsText(f, 'utf-8'); };
  $('#csvYukle', m.el).onclick = () => {
    const l = csvAyristir($('#csvMetin', m.el).value).filter(r => r.ad && ilKonum(r.il)); if (!l.length) { toast('Geçerli satır bulunamadı'); return; }
    const yeni = l.map((r, i) => { const k = ilKonum(r.il), lat = parseFloat(String(r.enlem || r.lat || '').replace(',', '.')), lon = parseFloat(String(r.boylam || r.lon || '').replace(',', '.')); const ai = ASAMA.findIndex(a => a.toLocaleLowerCase('tr') === String(r.asama || '').toLocaleLowerCase('tr'));
      return { id: 'c' + Date.now().toString(36) + i, ad: r.ad, il: TRV.iller.find(x => x[0].toLocaleLowerCase('tr') === r.il.toLocaleLowerCase('tr'))[0], ilce: r.ilce || '', bolge: ilBolge(r.il), lat: isFinite(lat) ? lat : k[1] + (Math.random() - .5) * .3, lon: isFinite(lon) ? lon : k[0] + (Math.random() - .5) * .4, asama: ai >= 0 ? ai : (+r.asama || 0), pilot: false, temsili: false, urun: '' }; });
    if ($('#csvDegis', m.el).checked) { const sil = new Set(S.yegler.filter(y => y.temsili).map(y => y.id)); S.yegler = S.yegler.filter(y => !y.temsili); Object.keys(S.stant).forEach(k => { if (sil.has(S.stant[k])) delete S.stant[k]; }); }
    S.yegler.push(...yeni); kaydet(); haritalariGuncelle(); m.kapat(); SAYFA.yonetim.ciz('yegler');
    yonetimOlay('yeg', `CSV'den <b>${yeni.length}</b> YEG içe aktarıldı`); toast(`✓ ${yeni.length} YEG içe aktarıldı · harita güncellendi`);
  };
}
