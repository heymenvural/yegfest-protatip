/* =====================================================================
   FİKİR GALERİSİ ve FİKİR DETAYI
===================================================================== */
const GF = { tema: '', q: '', sira: 'oy' };

SAYFA.fikirler = {
  html(r) {
    if (r.sorgu.has('tema')) GF.tema = r.sorgu.get('tema');
    const juri = asamaGecti('degerlendirme');
    return `<section class="sayfa-bas"><small>Fikir galerisi</small><h1>${tumFikirler().length} fikir, <em>tek hedef</em></h1>
      <p class="lead">Beğendiğin fikre kalp bırak. Halk oylaması jüri puanından bağımsızdır ve festivalde ayrıca açıklanır.</p></section>
    <section class="blok ust0">
      <div class="filtre ani">
        <div class="ara">🔎<input id="gAra" placeholder="Fikir, takım ya da il ara…" value="${esc(GF.q)}"></div>
        <div class="secim kucuk" id="gTema"><button data-t="" class="${!GF.tema ? 'on' : ''}">Tümü</button>${TEMALAR.map(t => `<button data-t="${t.id}" class="${GF.tema === t.id ? 'on' : ''}">${t.ikon} ${t.ad.split(' ')[0]}</button>`).join('')}</div>
        <select id="gSira"><option value="oy">En çok oy</option><option value="yeni">En yeni</option>${juri ? '<option value="puan">Jüri puanı</option>' : ''}</select>
      </div>
      <div class="fk-izgara" id="gListe"></div>
    </section>`;
  },
  bagla() {
    $('#gSira').value = GF.sira === 'puan' && !asamaGecti('degerlendirme') ? 'oy' : GF.sira;
    $('#gAra').oninput = e => { GF.q = e.target.value; liste(); };
    $$('#gTema button').forEach(b => b.onclick = () => { GF.tema = b.dataset.t; $$('#gTema button').forEach(x => x.classList.toggle('on', x === b)); liste(); });
    $('#gSira').onchange = e => { GF.sira = e.target.value; liste(); };
    liste();
  }
};
function liste() {
  const q = GF.q.toLocaleLowerCase('tr');
  let l = tumFikirler().filter(f => (!GF.tema || f.tema === GF.tema) && (!q || [f.baslik, f.takim, f.il, f.cozum].join(' ').toLocaleLowerCase('tr').includes(q)));
  if (GF.sira === 'oy') l.sort((a, b) => oySayisi(b) - oySayisi(a));
  if (GF.sira === 'yeni') l.sort((a, b) => (b.tarih || 0) - (a.tarih || 0) || b.id.localeCompare(a.id));
  if (GF.sira === 'puan') l.sort((a, b) => (agirlikli(puanOf(b)) ?? -1) - (agirlikli(puanOf(a)) ?? -1));
  $('#gListe').innerHTML = l.length ? l.map(fikirKart).join('') : '<div class="bos">Bu filtreyle fikir bulunamadı.</div>';
  oyBagla($('#gListe')); gozlem();
}

SAYFA.fikir = {
  html(r) {
    const f = fikir(r.par[0]);
    if (!f) return `<section class="sayfa-bas"><h1>Fikir bulunamadı</h1><p><a class="btn" href="#/fikirler">Galeriye dön</a></p></section>`;
    const t = tema(f.tema), p = puanOf(f), juri = asamaGecti('degerlendirme') && p, s = agirlikli(p);
    const fin = asamaGecti('mentorluk') && finalistler().some(x => x.id === f.id), uc = asamaGecti('final') && ilkUc().some(x => x.id === f.id);
    const m = MENTORLAR.find(x => x.id === mentorOf(f));
    return `<section class="fd-bas" style="--tc:${t.renk}"><div class="fd-ic">
      <a class="geri" href="#/fikirler">← Galeri</a>
      <div class="fd-cip"><span>${t.ikon} ${t.ad}</span><span>${f.id}</span>${f.yeni ? '<span>Yeni başvuru</span>' : '<span>temsilî</span>'}${fin ? '<span class="altin">İlk 10</span>' : ''}${uc ? '<span class="altin">🏆 Festival finalisti</span>' : ''}</div>
      <h1>${esc(f.baslik)}</h1><p class="lead">${esc(f.takim)} · ${esc(f.il)} · ${esc(f.tur)} · ${f.kisi} kişi</p></div></section>
    <section class="blok ust0"><div class="fd">
      <div class="fd-ana">
        <div class="kart ani"><small class="et">Sorun</small><p class="buyuk">${esc(f.problem)}</p></div>
        <div class="kart ani" data-g=".06"><small class="et">Çözüm</small><p class="buyuk">${esc(f.cozum)}</p><div class="etk">${(f.etiket || []).map(e => `<span>${esc(e)}</span>`).join('')}</div></div>
        ${juri ? `<div class="kart ani" data-g=".12"><small class="et">Jüri değerlendirmesi</small><div class="puan-d"><div class="halka" style="--p:${s}"><b>${s}</b><span>/100</span></div>
          <div class="kr">${KRITER.map(k => `<div><span>${k.ad} <em>%${k.agirlik}</em></span><div class="cb"><i style="width:${p[k.id] * 10}%"></i></div><b>${p[k.id]}</b></div>`).join('')}</div></div></div>` : ''}
      </div>
      <aside class="fd-yan">
        <div class="kart ani oykart"><button class="oy buyuk-oy ${DURUM.oylar[f.id] ? 'on' : ''}" data-oy="${f.id}"><i>${DURUM.oylar[f.id] ? '♥' : '♡'}</i><b>${oySayisi(f)}</b></button><p>Halk oylaması</p></div>
        ${fin && m ? `<div class="kart ani mentor"><small class="et">Mentor</small><div><i>${m.ikon}</i><div><b>${m.ad}</b><span>${m.kurum}</span></div></div></div>` : ''}
        <div class="kart ani qrk"><div class="qr">${qrSVG(SITE + '/hackathon#/fikir/' + f.id)}</div><p>Fikri paylaş</p></div>
      </aside>
    </div></section>`;
  },
  bagla() { oyBagla(); }
};
