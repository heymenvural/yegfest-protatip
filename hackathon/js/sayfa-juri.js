/* =====================================================================
   JÜRİ PANELİ — puanlama, sıralama, ilk 10, mentor eşleştirme, ilk 3
===================================================================== */
let JS = { secili: null, filtre: 'hepsi' };

SAYFA.juri = {
  html() {
    const l = tumFikirler(), puanli = l.filter(f => puanOf(f)).length;
    return `<section class="sayfa-bas"><small>Jüri paneli</small><h1>Beş kriter, <em>şeffaf puan</em></h1>
      <p class="lead">Kurum ve üniversitelerden oluşan jüri her fikri 0–10 arası puanlar; ağırlıklı toplam 100 üzerinden hesaplanır.</p></section>
    <section class="blok ust0">
      <div class="j-ozet ani">
        <div><b>${l.length}</b><span>başvuru</span></div><div><b>${puanli}</b><span>puanlandı</span></div><div><b>${l.length - puanli}</b><span>bekliyor</span></div>
        <div class="kriterler">${KRITER.map(k => `<span title="${k.acik}">${k.ad} <b>%${k.agirlik}</b></span>`).join('')}</div>
      </div>
      <div class="juri">
        <div class="kart j-liste ani">
          <div class="j-ust"><h4>Başvurular</h4><div class="secim kucuk" id="jF">${[['hepsi', 'Tümü'], ['bekleyen', 'Bekleyen'], ['puanli', 'Puanlı']].map(([k, n]) => `<button data-f="${k}" class="${JS.filtre === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
          <div id="jListe"></div>
        </div>
        <div class="kart j-form ani" data-g=".06" id="jForm"></div>
      </div>
      <div class="kart ani j-sira"><div class="j-ust"><h4>Sıralama</h4><div class="yatay">
        <button class="btn sm" id="ilk10">İlk 10'u onayla → mentorluk</button><button class="btn sm gold" id="ilk3">Finali tamamla → ilk 3</button></div></div>
        <div id="jSira"></div></div>
      <div class="kart ani" id="jMentor"></div>
    </section>`;
  },
  bagla() {
    if (!JS.secili || !fikir(JS.secili)) JS.secili = (tumFikirler().find(f => !puanOf(f)) || tumFikirler()[0]).id;
    $$('#jF button').forEach(b => b.onclick = () => { JS.filtre = b.dataset.f; $$('#jF button').forEach(x => x.classList.toggle('on', x === b)); jListe(); });
    $('#ilk10').onclick = () => {
      const top = sirali().filter(x => x.s != null).slice(0, 10).map(x => x.f.id);
      DURUM.finalist = top; DURUM.ilk3 = null; if (!asamaGecti('mentorluk')) DURUM.asama = 'mentorluk'; kaydet(); konfeti(); toast('İlk 10 belirlendi, mentorluk başladı'); ciz();
    };
    $('#ilk3').onclick = () => {
      if (!DURUM.finalist) return toast('Önce ilk 10’u onayla');
      DURUM.ilk3 = finalistler().map(f => ({ f, s: agirlikli(puanOf(f)) })).sort((a, b) => b.s - a.s).slice(0, 3).map(x => x.f.id);
      DURUM.asama = 'festival'; kaydet(); location.hash = '#/final';
    };
    jListe(); jForm(); jSira(); jMentor();
  }
};

function jListe() {
  let l = tumFikirler();
  if (JS.filtre === 'bekleyen') l = l.filter(f => !puanOf(f));
  if (JS.filtre === 'puanli') l = l.filter(f => puanOf(f));
  $('#jListe').innerHTML = l.map(f => { const s = agirlikli(puanOf(f)), t = tema(f.tema);
    return `<button class="jl ${JS.secili === f.id ? 'on' : ''}" data-id="${f.id}"><i style="background:${t.renk}">${t.ikon}</i><div><b>${esc(f.baslik)}</b><span>${esc(f.takim)} · ${f.id}</span></div>${s != null ? `<em class="sk">${s}</em>` : '<em class="bk">Bekliyor</em>'}</button>`; }).join('') || '<div class="bos">Kayıt yok</div>';
  $$('#jListe .jl').forEach(b => b.onclick = () => { JS.secili = b.dataset.id; jListe(); jForm(); });
}

function jForm() {
  const f = fikir(JS.secili); if (!f) return;
  const p = { ...(puanOf(f) || { yenilik: 5, uygulama: 5, etki: 5, surdur: 5, sunum: 5 }) };
  $('#jForm').innerHTML = `<div class="jf-bas"><small style="color:${tema(f.tema).renk}">${tema(f.tema).ikon} ${tema(f.tema).ad}</small><h3>${esc(f.baslik)}</h3><p class="kc">${esc(f.takim)} · ${esc(f.il)} · ${f.kisi} kişi</p></div>
    <div class="jf-metin"><div><b>Sorun</b><p>${esc(f.problem)}</p></div><div><b>Çözüm</b><p>${esc(f.cozum)}</p></div></div>
    <div class="jf-puan"><div class="kayd">${KRITER.map(k => `<label><span>${k.ad}<em>%${k.agirlik}</em></span><input type="range" min="0" max="10" step="1" value="${p[k.id]}" data-k="${k.id}"><b>${p[k.id]}</b></label>`).join('')}</div>
      <div class="halka buyuk" id="jHalka" style="--p:${agirlikli(p)}"><b>${agirlikli(p)}</b><span>/100</span></div></div>
    <div class="jf-alt"><button class="btn gold" id="jKaydet">Puanı kaydet</button><button class="btn ghost" id="jSonraki">Sonraki bekleyen →</button></div>`;
  $$('#jForm input[type=range]').forEach(r => r.oninput = () => {
    p[r.dataset.k] = +r.value; r.nextElementSibling.textContent = r.value; r.style.setProperty('--v', r.value * 10 + '%');
    const s = agirlikli(p); $('#jHalka').style.setProperty('--p', s); $('#jHalka b').textContent = s;
  });
  $$('#jForm input[type=range]').forEach(r => r.style.setProperty('--v', r.value * 10 + '%'));
  $('#jKaydet').onclick = () => { DURUM.puanlar[f.id] = { ...p }; kaydet(); toast(`${f.id} puanlandı: ${agirlikli(p)}/100`); jListe(); jSira(); };
  $('#jSonraki').onclick = () => { const n = tumFikirler().find(x => !puanOf(x) && x.id !== f.id); if (!n) return toast('Bekleyen başvuru kalmadı'); JS.secili = n.id; jListe(); jForm(); };
}

function jSira() {
  const fin = DURUM.finalist ? new Set(DURUM.finalist) : null, uc = DURUM.ilk3 ? new Set(DURUM.ilk3) : null;
  const l = sirali().filter(x => x.s != null);
  $('#jSira').innerHTML = `<table class="tablo"><thead><tr><th>#</th><th>Fikir</th><th>Tema</th>${KRITER.map(k => `<th class="gz">${k.ad.split(' ')[0]}</th>`).join('')}<th>Halk oyu</th><th>Puan</th></tr></thead><tbody>
    ${l.map((x, i) => { const p = puanOf(x.f); return `<tr class="${i < 10 ? 'ust10' : ''} ${uc?.has(x.f.id) ? 'uc' : ''}"><td><b>${i + 1}</b></td><td><a href="#/fikir/${x.f.id}">${esc(x.f.baslik)}</a><span>${esc(x.f.takim)}${fin?.has(x.f.id) ? ' · <em>İlk 10</em>' : ''}</span></td><td>${tema(x.f.tema).ikon}</td>${KRITER.map(k => `<td class="gz">${p[k.id]}</td>`).join('')}<td>♥ ${oySayisi(x.f)}</td><td><b class="sk">${x.s}</b></td></tr>`; }).join('')}
  </tbody></table>${l.length > 10 ? '<p class="not">Altın çizginin üstündeki ilk 10 fikir mentorluk aşamasına geçer.</p>' : ''}`;
}

function jMentor() {
  const el = $('#jMentor');
  if (!asamaGecti('mentorluk')) { el.innerHTML = `<div class="j-ust"><h4>Mentor eşleştirme</h4></div><p class="kc">İlk 10 onaylandığında burada her takıma bir uzman atanır.</p>`; return; }
  const l = finalistler();
  el.innerHTML = `<div class="j-ust"><h4>Mentor eşleştirme · ilk 10</h4><span class="kc">Takım temasına göre önerilen uzman seçili gelir</span></div>
    <div class="mentor-iz">${l.map(f => `<div class="mi"><i style="background:${tema(f.tema).renk}">${tema(f.tema).ikon}</i><div><b>${esc(f.baslik)}</b><span>${esc(f.takim)}</span></div>
      <select data-id="${f.id}">${MENTORLAR.map(m => `<option value="${m.id}" ${mentorOf(f) === m.id ? 'selected' : ''}>${m.ikon} ${m.ad}</option>`).join('')}</select></div>`).join('')}</div>`;
  $$('#jMentor select').forEach(s => s.onchange = () => { DURUM.mentorlar[s.dataset.id] = s.value; kaydet(); toast('Mentor atandı'); });
}
