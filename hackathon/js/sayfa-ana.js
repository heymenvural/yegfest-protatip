/* =====================================================================
   ANASAYFA ve TEMALAR
===================================================================== */
function durumCip() {
  const a = DURUM.asama;
  const m = {
    duyuru: ['Çağrı yayında', 'Başvurular Mart’ta açılıyor'],
    basvuru: ['Başvurular açık', '30 Nisan 2027 saat 23.59’a kadar'],
    degerlendirme: ['Ön değerlendirme sürüyor', 'Jüri ilk 10 fikri seçiyor'],
    mentorluk: ['Mentorluk dönemi', 'İlk 10 takım uzmanlarla çalışıyor'],
    final: ['Çevrimiçi final', 'İlk 3 fikir seçiliyor'],
    festival: ['YEGFEST 2027', 'İlk 3 fikir festival sahnesinde'],
    havuz: ['Fikir havuzu', 'Fikirler destek programlarına yönlendiriliyor'],
  }[a];
  return `<div class="cip"><i></i><b>${m[0]}</b><span>${m[1]}</span></div>`;
}

function surecHTML() {
  const ci = asamaIdx();
  return `<div class="surec" style="--ilerle:${(ci / (ASAMALAR.length - 1)) * 100}%"><div class="hat"><i></i></div>
    ${ASAMALAR.map((a, i) => `<div class="adim ani ${i < ci ? 'bitti' : ''} ${i === ci ? 'simdi' : ''}" data-g="${i * .06}">
      <div class="nok">${a.ikon}</div><small>${a.ay}</small><b>${a.ad}</b><p>${a.acik}</p>${i === ci ? '<em class="bu">Şu an</em>' : ''}</div>`).join('')}
  </div>`;
}

SAYFA[''] = {
  html() {
    const sayac = ['duyuru', 'basvuru'].includes(DURUM.asama) ? ['Başvuruların kapanmasına', HK.basvuruSon] : ['YEGFEST 2027 sahnesine', HK.festival];
    const one = [...tumFikirler()].sort((a, b) => oySayisi(b) - oySayisi(a)).slice(0, 3);
    return `
    <section class="hero">
      <canvas id="sahne"></canvas>
      <div class="hero-ic">
        ${durumCip()}
        <h1>Toprağa <em>teknoloji</em>,<br>kırsala <em>fikir</em>.</h1>
        <p class="lead">Genç çiftçileri, öğrencileri ve girişimcileri tarımda yenilik ve teknoloji odaklı fikirlerle buluşturan <b>6 aylık</b> süreç. En iyi üç fikir <b>YEGFEST 2027</b> sahnesinde.</p>
        <div class="cta"><a class="btn gold lg" href="#/basvuru">Fikrini gönder →</a><a class="btn cam lg" href="#/temalar">5 temayı incele</a></div>
        <div class="gs-k"><small>${sayac[0]}</small><div class="gs" id="gs"></div></div>
      </div>
      <div class="hero-etiket"><span>📡 Sensör</span><span>🛰️ Uydu</span><span>🤖 Yapay zekâ</span><span>💧 Su</span></div>
    </section>

    <section class="seritler">
      <div><b data-say="6">0</b><span>aylık süreç</span></div>
      <div><b data-say="5">0</b><span>tema</span></div>
      <div><b data-say="${tumFikirler().length}">0</b><span>başvuru</span></div>
      <div><b data-say="10">0</b><span>takım mentorlukta</span></div>
      <div><b data-say="3">0</b><span>fikir festival sahnesinde</span></div>
    </section>

    <section class="blok">
      <div class="bas ani"><small>Süreç</small><h2>Martta çağrı, <em>eylülde sahne</em></h2><p>Her aşama çevrimiçi ilerler; yalnızca ilk üç takım festivale davet edilir.</p></div>
      ${surecHTML()}
    </section>

    <section class="blok">
      <div class="bas ani"><small>Temalar</small><h2>Beş alan, <em>tek soru:</em> kırsalda hayatı nasıl kolaylaştırırız?</h2></div>
      <div class="tema-izgara">${TEMALAR.map((t, i) => `<a class="tk ani" data-g="${i * .06}" href="#/temalar" style="--tc:${t.renk}"><i>${t.ikon}</i><b>${t.ad}</b><p>${t.soru}</p><span>${tumFikirler().filter(f => f.tema === t.id).length} fikir →</span></a>`).join('')}</div>
    </section>

    <section class="blok koyu">
      <div class="bas ani"><small>Halk oylaması</small><h2>En çok desteklenen <em>fikirler</em></h2><p>Ziyaretçiler fikirlere kalp bırakabilir; halk oyu jüri puanına ek olarak açıklanır.</p></div>
      <div class="fk-izgara">${one.map(fikirKart).join('')}</div>
      <div class="orta ani"><a class="btn cam" href="#/fikirler">Tüm fikirleri gör →</a></div>
    </section>

    <section class="blok">
      <div class="iki">
        <div class="ani"><div class="bas sol"><small>Ödüller</small><h2>Sahne, <em>destek</em> ve görünürlük</h2></div>
          <div class="odul">${ODULLER.map(o => `<div class="od s${o.sira}"><div class="md">${['🥇', '🥈', '🥉'][o.sira - 1]}</div><div><b>${o.ad}</b><p>${o.acik}</p></div></div>`).join('')}</div></div>
        <div class="ani" data-g=".1"><div class="bas sol"><small>Sonrası</small><h2>Fikirler <em>rafta kalmaz</em></h2></div>
          <div class="destek">${DESTEK.map(d => `<div><i>→</i><div><b>${d.ad}</b><p>${d.acik}</p></div></div>`).join('')}</div>
          <p class="not">Mentorluk alan 10 takımın tamamı, uygun destek programına başvuru için yönlendirilir.</p></div>
      </div>
    </section>

    <section class="blok">
      <div class="bas ani"><small>Sık sorulanlar</small><h2>Aklına takılanlar</h2></div>
      <div class="sss">${SSS.map(([s, c], i) => `<details class="ani" data-g="${i * .05}" ${i === 0 ? 'open' : ''}><summary>${s}</summary><p>${c}</p></details>`).join('')}</div>
    </section>

    <section class="cta-bant ani"><div><h2>Bir fikrin mi var?</h2><p>Bireysel ya da en fazla 5 kişilik takımla, 10 dakikada başvur.</p></div><a class="btn gold lg" href="#/basvuru">Başvuruya başla →</a></section>`;
  },
  bagla() {
    geriSayim($('#gs'), ['duyuru', 'basvuru'].includes(DURUM.asama) ? HK.basvuruSon : HK.festival);
    oyBagla();
    const c = $('#sahne'); if (window.HKSAHNE) HKSAHNE.kur(c); else window.HKSAHNE_BEKLE = c;
  }
};

SAYFA.temalar = {
  html() {
    return `<section class="sayfa-bas"><small>Temalar</small><h1>Beş tema, <em>beş meydan okuma</em></h1><p class="lead">Her tema gerçek bir kırsal soruna dayanır. Örnek fikirler yalnızca ilham içindir; kendi çözümünü getirebilirsin.</p></section>
    <section class="blok ust0">${TEMALAR.map((t, i) => {
      const n = tumFikirler().filter(f => f.tema === t.id).length;
      return `<article class="tema-b ani" style="--tc:${t.renk}">
        <div class="tb-sol"><div class="tb-ik">${t.ikon}</div><small>Tema ${i + 1}</small><h2>${t.ad}</h2><blockquote>${t.soru}</blockquote>
          <div class="tb-alt"><span><b>${n}</b> fikir</span><a class="btn sm" href="#/basvuru?tema=${t.id}">Bu temada başvur</a><a class="btn sm cam2" href="#/fikirler?tema=${t.id}">Fikirleri gör</a></div></div>
        <div class="tb-sag"><div><h4>Örnek fikirler</h4><ul>${t.ornek.map(o => `<li>${o}</li>`).join('')}</ul></div>
          <div><h4>Kullanılabilecek açık veriler</h4><ul class="veri">${t.veri.map(o => `<li>${o}</li>`).join('')}</ul></div></div>
      </article>`;
    }).join('')}</section>`;
  }
};
