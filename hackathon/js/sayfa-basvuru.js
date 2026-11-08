/* =====================================================================
   BAŞVURU — 4 adımlı form, önizleme, başvuru takibi
===================================================================== */
const IL = ['Adana', 'Ankara', 'Antalya', 'Aydın', 'Balıkesir', 'Bursa', 'Denizli', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Hatay', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Kars', 'Kastamonu', 'Kayseri', 'Kocaeli', 'Konya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Ordu', 'Rize', 'Samsun', 'Şanlıurfa', 'Tokat', 'Trabzon', 'Van', 'Yozgat'];
const ETIKET = ['Yapay zekâ', 'Mobil', 'IoT', 'Sensör', 'Uydu', 'Görüntü işleme', 'SMS', 'Platform', 'QR', 'Kooperatif', 'Enerji', 'Düşük maliyet', 'Çevrimdışı', 'Eğitim'];
let FORM = { adim: 0, takim: '', tur: 'Öğrenci', kisi: 3, il: '', eposta: '', tema: '', baslik: '', problem: '', cozum: '', etiket: [], onay: false };
const ADIMLAR = ['Takım', 'Tema', 'Fikir', 'Önizleme'];

SAYFA.basvuru = {
  html(r) {
    if (r.sorgu.get('tema')) FORM.tema = r.sorgu.get('tema');
    const kapali = !['duyuru', 'basvuru'].includes(DURUM.asama);
    return `<section class="sayfa-bas"><small>Başvuru</small><h1>Fikrini <em>10 dakikada</em> gönder</h1>
      <p class="lead">Bireysel ya da en fazla 5 kişilik takım. Yazılım bilmen gerekmez; iyi tanımlanmış bir sorun ve çözüm yeterli.</p></section>
    <section class="blok ust0"><div class="bv">
      <div class="bv-form kart ani">
        ${kapali ? `<div class="uyari">Simülasyonda başvuru dönemi kapandı. Formu yine de deneyebilirsin; aşamayı alttaki prototip menüsünden değiştirebilirsin.</div>` : ''}
        <div class="adimlar" id="adimlar"></div>
        <div id="adimIc"></div>
        <div class="bv-alt"><button class="btn ghost" id="geri">← Geri</button><button class="ornek" id="ornek">✨ Örnek doldur</button><button class="btn" id="ileri">İleri →</button></div>
      </div>
      <aside class="bv-yan">
        <div class="kart ani" data-g=".08"><h4>Başvurunu sorgula</h4><p class="kc">Başvuru kodunla durumunu gör.</p>
          <div class="sorgu"><input id="kodIn" placeholder="HK27-1234"><button class="btn sm" id="kodBtn">Sorgula</button></div><div id="kodSonuc"></div></div>
        <div class="kart ani ipucu" data-g=".14"><h4>İyi bir başvuru</h4><ul><li><b>Sorunu</b> bir üreticinin gözünden anlat</li><li><b>Çözümün</b> kırsal koşullarda nasıl çalışacağını yaz</li><li><b>Maliyeti</b> ve kimin kullanacağını belirt</li><li>Jüri <b>5 kriterle</b> puanlar: ${KRITER.map(k => k.ad.toLocaleLowerCase('tr')).join(', ')}</li></ul></div>
      </aside>
    </div></section>`;
  },
  bagla() { adimCiz(); $('#kodBtn').onclick = sorgula; $('#kodIn').onkeydown = e => e.key === 'Enter' && sorgula(); }
};

function adimCiz() {
  const a = FORM.adim;
  $('#adimlar').innerHTML = ADIMLAR.map((n, i) => `<div class="ad ${i < a ? 'ok' : ''} ${i === a ? 'on' : ''}"><i>${i < a ? '✓' : i + 1}</i><span>${n}</span></div>`).join('<b></b>');
  const ic = $('#adimIc');
  if (a === 0) ic.innerHTML = `<h3>Takımını tanıt</h3>
    <label class="alan"><span>Takım adı</span><input id="f-takim" value="${esc(FORM.takim)}" placeholder="Örn. Yaprak Göz"></label>
    <div class="alan"><span>Katılımcı türü</span><div class="secim" id="f-tur">${['Genç çiftçi', 'Öğrenci', 'Girişimci', 'Karma takım'].map(t => `<button data-v="${t}" class="${FORM.tur === t ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <div class="iki-alan"><div class="alan"><span>Kişi sayısı</span><div class="sayac2"><button data-d="-1">−</button><b id="f-kisi">${FORM.kisi}</b><button data-d="1">+</button></div></div>
      <label class="alan"><span>İl</span><select id="f-il"><option value="">Seç</option>${IL.map(i => `<option ${FORM.il === i ? 'selected' : ''}>${i}</option>`).join('')}</select></label></div>
    <label class="alan"><span>E-posta</span><input id="f-eposta" type="email" value="${esc(FORM.eposta)}" placeholder="takim@ornek.com"></label>`;
  if (a === 1) ic.innerHTML = `<h3>Hangi temada çalışacaksın?</h3><div class="tema-sec">${TEMALAR.map(t => `<button data-t="${t.id}" class="${FORM.tema === t.id ? 'on' : ''}" style="--tc:${t.renk}"><i>${t.ikon}</i><b>${t.ad}</b><span>${t.soru}</span></button>`).join('')}</div>`;
  if (a === 2) ic.innerHTML = `<h3>Fikrini anlat</h3>
    <label class="alan"><span>Fikrin adı</span><input id="f-baslik" maxlength="70" value="${esc(FORM.baslik)}" placeholder="Kısa ve akılda kalıcı"></label>
    <label class="alan"><span>Hangi sorunu çözüyor? <em class="say" id="c-problem"></em></span><textarea id="f-problem" maxlength="300" rows="3" placeholder="Bir üreticinin yaşadığı somut sorun">${esc(FORM.problem)}</textarea></label>
    <label class="alan"><span>Çözümün ne? <em class="say" id="c-cozum"></em></span><textarea id="f-cozum" maxlength="400" rows="4" placeholder="Nasıl çalışır, kim kullanır, maliyeti ne olur?">${esc(FORM.cozum)}</textarea></label>
    <div class="alan"><span>Etiketler <em>(en fazla 4)</em></span><div class="secim kucuk" id="f-etiket">${ETIKET.map(t => `<button data-v="${t}" class="${FORM.etiket.includes(t) ? 'on' : ''}">${t}</button>`).join('')}</div></div>`;
  if (a === 3) {
    const f = { ...FORM, id: 'HK27-····', oy: 0, yeni: true };
    ic.innerHTML = `<h3>Son kontrol</h3><p class="kc">Fikrin galeride böyle görünecek.</p><div class="onizle">${fikirKart(f)}</div>
      <label class="onay"><input type="checkbox" id="f-onay" ${FORM.onay ? 'checked' : ''}><span>Kişisel verilerimin başvuru sürecinde işlenmesini ve fikrimin adının, özetinin tanıtım amacıyla paylaşılmasını kabul ediyorum.</span></label>`;
    $$('.onizle .ani').forEach(e => e.classList.add('gor'));
  }
  $('#geri').style.visibility = a ? 'visible' : 'hidden';
  $('#ileri').textContent = a === 3 ? 'Başvuruyu gönder ✓' : 'İleri →';
  $('#ileri').className = 'btn ' + (a === 3 ? 'gold' : '');
  $('#geri').onclick = () => { topla(); FORM.adim--; adimCiz(); };
  $('#ileri').onclick = ileri;
  $('#ornek').onclick = ornekDoldur;
  // etkileşimler
  $$('#f-tur button').forEach(b => b.onclick = () => { FORM.tur = b.dataset.v; $$('#f-tur button').forEach(x => x.classList.toggle('on', x === b)); });
  $$('.sayac2 button').forEach(b => b.onclick = () => { FORM.kisi = Math.max(1, Math.min(5, FORM.kisi + +b.dataset.d)); $('#f-kisi').textContent = FORM.kisi; });
  $$('.tema-sec button').forEach(b => b.onclick = () => { FORM.tema = b.dataset.t; $$('.tema-sec button').forEach(x => x.classList.toggle('on', x === b)); });
  $$('#f-etiket button').forEach(b => b.onclick = () => {
    const v = b.dataset.v, i = FORM.etiket.indexOf(v);
    if (i >= 0) FORM.etiket.splice(i, 1); else if (FORM.etiket.length < 4) FORM.etiket.push(v); else return toast('En fazla 4 etiket seçebilirsin');
    b.classList.toggle('on', i < 0);
  });
  ['problem', 'cozum'].forEach(k => { const t = $('#f-' + k); if (!t) return; const u = () => $('#c-' + k).textContent = `${t.value.length}/${t.maxLength}`; t.oninput = u; u(); });
}

function topla() {
  const v = id => $('#f-' + id)?.value?.trim();
  if (FORM.adim === 0) Object.assign(FORM, { takim: v('takim') ?? FORM.takim, il: v('il') ?? FORM.il, eposta: v('eposta') ?? FORM.eposta });
  if (FORM.adim === 2) Object.assign(FORM, { baslik: v('baslik') ?? FORM.baslik, problem: v('problem') ?? FORM.problem, cozum: v('cozum') ?? FORM.cozum });
  if (FORM.adim === 3) FORM.onay = $('#f-onay')?.checked;
}

function ileri() {
  topla();
  const hata = [
    () => !FORM.takim ? 'Takım adını yaz' : !FORM.il ? 'İl seç' : !/^\S+@\S+\.\S+$/.test(FORM.eposta) ? 'Geçerli bir e-posta yaz' : '',
    () => !FORM.tema ? 'Bir tema seç' : '',
    () => FORM.baslik.length < 5 ? 'Fikrine bir ad ver' : FORM.problem.length < 30 ? 'Sorunu biraz daha aç (en az 30 karakter)' : FORM.cozum.length < 40 ? 'Çözümü biraz daha aç (en az 40 karakter)' : '',
    () => !FORM.onay ? 'Onay kutusunu işaretle' : '',
  ][FORM.adim]();
  if (hata) { toast(hata); $('#adimIc').classList.remove('salla'); void $('#adimIc').offsetWidth; $('#adimIc').classList.add('salla'); return; }
  if (FORM.adim < 3) { FORM.adim++; adimCiz(); return; }
  gonder();
}

function ornekDoldur() {
  const t = FORM.tema || 'akilli';
  const o = {
    akilli: ['Zeytin sineği için akıllı tuzak', 'Zeytin sineği zamanında tespit edilemediği için ya gereksiz ilaçlama yapılıyor ya da ürün kaybediliyor.', 'Kameralı tuzak, yakalanan sinekleri yapay zekâyla sayar; eşik aşıldığında üreticiye ve ziraat odasına bildirim gönderir. Tuzak başına maliyet düşük, güneş paneliyle çalışır.', ['Yapay zekâ', 'IoT', 'Görüntü işleme']],
    su: ['Köy göleti su takip panosu', 'Sulama birlikleri göletteki suyun ne kadar kaldığını ve kimin ne kadar kullandığını bilmiyor.', 'Seviye sensörü ve basit bir pano ile gölet seviyesi, dağıtım takvimi ve kullanım payı herkese açık gösterilir; SMS ile sıra hatırlatılır.', ['Sensör', 'SMS', 'Platform']],
    pazar: ['Pazar yeri ön sipariş hattı', 'Semt pazarına getirilen ürünün bir kısmı satılamıyor ve geri dönüyor.', 'Tüketici bir gün önce WhatsApp ya da web üzerinden sipariş verir, üretici ne kadar ürün getireceğini bilir; fire azalır, gelir öngörülebilir olur.', ['Platform', 'Mobil', 'Kooperatif']],
    genc: ['Köy tecrübe ağı', 'Yeni başlayan genç çiftçi, deneyimli üreticilere ulaşamıyor ve aynı hataları tekrarlıyor.', 'Usta üreticilerle gençleri ürün ve bölgeye göre eşleştiren, sesli soru-cevap ve tarla ziyareti planlayan mobil ağ.', ['Mobil', 'Eğitim', 'Platform']],
    dongu: ['Pirinadan yakıt briketi', 'Zeytinyağı fabrikalarından çıkan pirina değerlendirilmeden bekletiliyor.', 'Köy ölçeğinde briket presiyle pirina yakıta dönüştürülür; kooperatif aracılığıyla seralara ve okullara satılır.', ['Enerji', 'Düşük maliyet', 'Kooperatif']],
  }[t];
  Object.assign(FORM, { takim: FORM.takim || 'Filiz', il: FORM.il || 'Aydın', eposta: FORM.eposta || 'filiz.takim@ornek.com', tur: FORM.tur || 'Öğrenci', tema: t, baslik: o[0], problem: o[1], cozum: o[2], etiket: o[3], onay: FORM.adim === 3 ? true : FORM.onay });
  if (FORM.adim === 3) FORM.onay = true;
  adimCiz(); toast('Örnek bilgiler dolduruldu');
}

function gonder() {
  const f = { id: yeniKod(), takim: FORM.takim, il: FORM.il, tur: FORM.tur, kisi: FORM.kisi, tema: FORM.tema, baslik: FORM.baslik, problem: FORM.problem, cozum: FORM.cozum, etiket: FORM.etiket, oy: 0, yeni: true, tarih: Date.now() };
  DURUM.basvurular.unshift(f); kaydet();
  FORM = { adim: 0, takim: '', tur: 'Öğrenci', kisi: 3, il: '', eposta: '', tema: '', baslik: '', problem: '', cozum: '', etiket: [], onay: false };
  konfeti();
  setTimeout(() => $('.bv-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  $('.bv-form').innerHTML = `<div class="tamam"><div class="tik">✓</div><small>Başvurun alındı</small><h2>${esc(f.baslik)}</h2>
    <div class="kod">${f.id}</div><p class="kc">Bu kodla başvurunu takip edebilirsin. Fikrin galeride yayında, halk oylamasına açık.</p>
    ${durumHatti(f)}
    <div class="tamam-alt"><div class="qr">${qrSVG(SITE + '/hackathon#/fikir/' + f.id)}</div><div><b>Fikrinin sayfası</b><p class="kc">QR'ı okutup paylaşabilirsin.</p><a class="btn" href="#/fikir/${f.id}">Fikri görüntüle →</a> <a class="btn ghost" href="#/basvuru" onclick="setTimeout(ciz)">Yeni başvuru</a></div></div></div>`;
}

function durumHatti(f) {
  const fin = finalistler().some(x => x.id === f.id), uc = ilkUc().some(x => x.id === f.id);
  const ai = asamaIdx();
  const satir = [
    ['Başvuru alındı', true, 'Kodun oluşturuldu, fikrin galeride'],
    ['Ön değerlendirme', ai >= 2, ai >= 2 ? (puanOf(f) ? `Jüri puanı: ${agirlikli(puanOf(f))}/100` : 'Jüri değerlendiriyor') : 'Mayıs ayında'],
    ['İlk 10 · mentorluk', ai >= 3 && fin, ai >= 3 ? (fin ? 'Mentor: ' + (MENTORLAR.find(m => m.id === mentorOf(f))?.ad || 'atanıyor') : 'Bu yıl ilk 10’a giremedi; fikir havuzunda') : 'Haziran–Temmuz'],
    ['Çevrimiçi final', ai >= 4 && fin, ai >= 4 ? (uc ? 'İlk 3’te! Festivale davetlisin' : fin ? 'Finalde sunum yaptı' : '—') : 'Ağustos'],
    ['YEGFEST sahnesi', ai >= 5 && uc, ai >= 5 && uc ? 'Eylül 2027 · İnovasyon sahnesi' : 'Eylül'],
  ];
  return `<div class="hat-d">${satir.map(([a, ok, d]) => `<div class="${ok ? 'ok' : ''}"><i>${ok ? '✓' : ''}</i><div><b>${a}</b><span>${d}</span></div></div>`).join('')}</div>`;
}

function sorgula() {
  const k = $('#kodIn').value.trim().toUpperCase(), f = fikir(k);
  $('#kodSonuc').innerHTML = f ? `<div class="sorgu-s"><b>${esc(f.baslik)}</b><span>${esc(f.takim)} · ${tema(f.tema).ad}</span>${durumHatti(f)}</div>` : `<p class="hata">Bu kodla bir başvuru bulunamadı. Örnek: ${ORNEK[0].id}</p>`;
}
