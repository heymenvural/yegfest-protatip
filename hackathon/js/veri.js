/* =====================================================================
   KIRSAL İNOVASYON HACKATHONU — veri katmanı (prototip)
   Tüm örnek takımlar ve fikirler temsilîdir.
===================================================================== */
const HK = {
  ad: 'Kırsal İnovasyon Hackathonu',
  yil: 2027,
  basvuruSon: '2027-04-30T23:59:00+03:00',
  festival: '2027-09-17T10:00:00+03:00',
};

const TEMALAR = [
  { id: 'akilli', ikon: '🤖', ad: 'Akıllı tarım ve yapay zekâ', renk: '#2E78C7',
    soru: 'Küçük ölçekli bir üretici, pahalı ekipman almadan verimini nasıl ölçer ve artırır?',
    ornek: ['Telefon kamerasıyla yaprak hastalığı tespiti', 'Uydu görüntüsüyle verim tahmini', 'Hasat zamanı öneren asistan'],
    veri: ['Sentinel-2 uydu görüntüleri', 'Bitki hastalığı görüntü setleri', 'İlçe bazlı üretim istatistikleri'] },
  { id: 'su', ikon: '💧', ad: 'Su ve iklime uyum', renk: '#1E9AA8',
    soru: 'Kuraklık ve aşırı hava olayları karşısında su nasıl daha az ve daha akıllı kullanılır?',
    ornek: ['Düşük maliyetli toprak nem sensörü', 'Don ve kuraklık erken uyarı SMS hattı', 'Damla sulama zamanlayıcısı'],
    veri: ['Meteoroloji istasyon verileri', 'Toprak nem ölçümleri', 'Havza su bütçesi'] },
  { id: 'pazar', ikon: '🛒', ad: 'Pazara erişim ve izlenebilirlik', renk: '#C9A227',
    soru: 'Yöresel ürün, aracıyı azaltarak ve hikâyesini koruyarak tüketiciye nasıl ulaşır?',
    ornek: ['Kooperatif ortak satış platformu', 'QR ile tarladan sofraya izlenebilirlik', 'Coğrafi işaretli ürün doğrulama'],
    veri: ['Coğrafi işaret listesi', 'Hal fiyatları', 'YEGFEST ilçe ürün kataloğu'] },
  { id: 'genc', ikon: '📱', ad: 'Genç çiftçi için dijital araçlar', renk: '#5E8C4A',
    soru: 'Kırsalda kalmak isteyen bir genç; kayıt, finansman ve bilgiye nasıl kolayca erişir?',
    ornek: ['Hibe ve destek eşleştirme asistanı', 'Sesli işletme kayıt defteri', 'Çiftçiden çiftçiye bilgi ağı'],
    veri: ['Destek programı çağrıları', 'IPARD tedbir rehberleri', 'Çiftçi kayıt istatistikleri'] },
  { id: 'dongu', ikon: '♻️', ad: 'Döngüsel tarım ve enerji', renk: '#7A5BA8',
    soru: 'Tarımsal atık; gübreye, enerjiye ya da yeni bir ürüne nasıl dönüşür?',
    ornek: ['Budama atığından pelet', 'Hayvansal atıktan biyogaz hesaplayıcı', 'Pirina ve kabuk değerlendirme'],
    veri: ['Atık miktarı tahminleri', 'Enerji tüketim verileri', 'Kompost reçeteleri'] },
];
const tema = id => TEMALAR.find(t => t.id === id) || TEMALAR[0];

const ASAMALAR = [
  { id: 'duyuru', ay: 'MART', ad: 'Duyuru', ikon: '📣', acik: 'Bakanlık, TKDK, TRGM ve YEG hesaplarından çağrı' },
  { id: 'basvuru', ay: 'MART–NİSAN', ad: 'Başvuru', ikon: '📝', acik: 'Bireysel ya da en fazla 5 kişilik takım' },
  { id: 'degerlendirme', ay: 'MAYIS', ad: 'Ön değerlendirme', ikon: '🔍', acik: 'Jüri puanlaması, ilk 10 fikir' },
  { id: 'mentorluk', ay: 'HAZİRAN–TEMMUZ', ad: 'Mentorluk', ikon: '🧑‍🏫', acik: 'Uzman ve akademisyen eşleştirmesi' },
  { id: 'final', ay: 'AĞUSTOS', ad: 'Çevrimiçi final', ikon: '🏁', acik: '10 takım sunar, ilk 3 seçilir' },
  { id: 'festival', ay: 'EYLÜL', ad: 'YEGFEST sahnesi', ikon: '🏆', acik: 'İlk 3 fikir festivalde sunulur' },
  { id: 'havuz', ay: 'SONRASI', ad: 'Fikir havuzu', ikon: '🌱', acik: 'Fikirler destek programlarına yönlendirilir' },
];

const KRITER = [
  { id: 'yenilik', ad: 'Yenilikçilik', agirlik: 25, acik: 'Fikir, mevcut çözümlerden ne kadar farklı?' },
  { id: 'uygulama', ad: 'Uygulanabilirlik', agirlik: 25, acik: 'Kırsal koşullarda, makul maliyetle hayata geçer mi?' },
  { id: 'etki', ad: 'Kırsala etkisi', agirlik: 25, acik: 'Üreticinin gelirine, zamanına ya da kaynağına katkısı' },
  { id: 'surdur', ad: 'Sürdürülebilirlik', agirlik: 15, acik: 'Çevresel ve ekonomik olarak kalıcı mı?' },
  { id: 'sunum', ad: 'Ekip ve sunum', agirlik: 10, acik: 'Ekibin yetkinliği ve anlatımın açıklığı' },
];

const MENTORLAR = [
  { id: 'm1', ad: 'Tarım makineleri akademisyeni', kurum: 'Ziraat fakültesi', ikon: '🎓' },
  { id: 'm2', ad: 'Yapay zekâ ve yazılım uzmanı', kurum: 'Teknokent firması', ikon: '💻' },
  { id: 'm3', ad: 'Kırsal kalkınma uzmanı', kurum: 'TKDK il koordinatörlüğü', ikon: '🏛️' },
  { id: 'm4', ad: 'Su yönetimi uzmanı', kurum: 'Araştırma enstitüsü', ikon: '💧' },
  { id: 'm5', ad: 'Pazarlama ve marka uzmanı', kurum: 'Kooperatif birliği', ikon: '📈' },
  { id: 'm6', ad: 'Girişimcilik ve finansman', kurum: 'Kuluçka merkezi', ikon: '🚀' },
];

const ODULLER = [
  { sira: 1, ad: 'İnovasyon Ödülü', acik: 'YEGFEST ana sahnesinde sunum, pilot uygulama desteği ve sponsor ödülü' },
  { sira: 2, ad: 'Etki Ödülü', acik: 'Festivalde stant, mentorlukla destek programı başvurusu' },
  { sira: 3, ad: 'Genç Çiftçi Ödülü', acik: 'Festivalde sunum ve kurumlarla birebir görüşme' },
];

const DESTEK = [
  { ad: 'IPARD III / TKDK', acik: 'Kırsal ekonomik altyapı ve çeşitlendirme yatırımları' },
  { ad: 'YEG yerel kalkınma stratejileri', acik: 'LEADER kapsamında yerel küçük projeler' },
  { ad: 'TÜBİTAK girişimcilik programları', acik: 'Teknoloji tabanlı iş fikirleri' },
  { ad: 'KOSGEB girişimcilik destekleri', acik: 'İşletmeye dönüşen fikirler' },
];

const SSS = [
  ['Kimler başvurabilir?', 'Genç çiftçiler, üniversite ve meslek yüksekokulu öğrencileri, girişimciler ve YEG gönüllüleri. Bireysel ya da en fazla 5 kişilik takım olarak başvurulabilir.'],
  ['Yazılım bilmem gerekiyor mu?', 'Hayır. Fikirler teknoloji içerebilir ama zorunlu değil; bir süreç, model ya da örgütlenme önerisi de değerlendirilir. Mentorluk aşamasında teknik destek verilir.'],
  ['Katılım ücretli mi?', 'Hayır. Başvuru, mentorluk ve çevrimiçi final ücretsizdir. Festivale davet edilen ilk 3 takımın ulaşımı organizasyon tarafından planlanır.'],
  ['Fikrin sahibi kim olur?', 'Fikir ve ürün takıma aittir. Organizasyon yalnızca tanıtım amacıyla fikrin adını ve özetini paylaşır.'],
  ['Değerlendirme nasıl yapılır?', 'Kurum ve üniversitelerden oluşan jüri beş kriterle puanlar: yenilikçilik, uygulanabilirlik, kırsala etkisi, sürdürülebilirlik, ekip ve sunum.'],
];

/* temsilî örnek fikirler */
const ORNEK = [
  { id: 'HK27-1042', takim: 'Yaprak Göz', il: 'Aydın', tur: 'Öğrenci', kisi: 4, tema: 'akilli', baslik: 'İncir yaprağından hastalık teşhisi',
    problem: 'İncir pası ve sineği geç fark edildiğinde rekoltenin önemli bir kısmı kaybediliyor.', cozum: 'Telefon kamerasıyla çekilen yaprak fotoğrafını çevrimdışı çalışan bir modelle sınıflandıran ve ilaçlama zamanı öneren uygulama.', etiket: ['Görüntü işleme', 'Mobil', 'Çevrimdışı'], oy: 214, puan: { yenilik: 9, uygulama: 8, etki: 9, surdur: 8, sunum: 9 }, mentor: 'm2' },
  { id: 'HK27-1017', takim: 'Damla', il: 'Konya', tur: 'Genç çiftçi', kisi: 3, tema: 'su', baslik: '30 liralık toprak nem sensörü',
    problem: 'Küçük üretici sulama kararını gözle veriyor; su ve elektrik boşa gidiyor.', cozum: 'Yerel malzemeyle üretilen nem sensörü, ölçümü SMS ile gönderir; eşik aşılınca sulama hatırlatması yapar.', etiket: ['IoT', 'SMS', 'Düşük maliyet'], oy: 187, puan: { yenilik: 8, uygulama: 9, etki: 9, surdur: 9, sunum: 7 }, mentor: 'm4' },
  { id: 'HK27-1088', takim: 'Ortak Tezgâh', il: 'Rize', tur: 'Girişimci', kisi: 5, tema: 'pazar', baslik: 'Kooperatifler için ortak sipariş havuzu',
    problem: 'Küçük kooperatifler tek başına büyük alıcıya yetecek hacmi toplayamıyor.', cozum: 'Aynı ürünü üreten kooperatiflerin siparişleri birleştirip ortak lojistikle teslim ettiği B2B platform.', etiket: ['Platform', 'Lojistik', 'Kooperatif'], oy: 152, puan: { yenilik: 7, uygulama: 8, etki: 9, surdur: 8, sunum: 8 }, mentor: 'm5' },
  { id: 'HK27-1003', takim: 'Sesli Defter', il: 'Erzurum', tur: 'Genç çiftçi', kisi: 2, tema: 'genc', baslik: 'Konuşarak tutulan işletme kaydı',
    problem: 'Genç çiftçiler gider-gelir kaydı tutmadığı için hibe başvurusunda zorlanıyor.', cozum: 'Sesli komutla gider, satış ve iş kaydı tutan; destek başvurusu için hazır rapor üreten uygulama.', etiket: ['Ses tanıma', 'Finans', 'Hibe'], oy: 133, puan: { yenilik: 8, uygulama: 8, etki: 8, surdur: 7, sunum: 8 }, mentor: 'm6' },
  { id: 'HK27-1121', takim: 'Budama', il: 'Manisa', tur: 'Öğrenci', kisi: 4, tema: 'dongu', baslik: 'Bağ budama atığından pelet',
    problem: 'Budama atıkları tarlada yakılıyor; hem hava kirliliği hem yangın riski oluşuyor.', cozum: 'Köy ölçeğinde mobil pelet makinesi ve atık toplama takvimi; pelet köy okullarında yakıt olarak kullanılır.', etiket: ['Enerji', 'Atık', 'Köy ölçeği'], oy: 121, puan: { yenilik: 8, uygulama: 7, etki: 8, surdur: 9, sunum: 7 }, mentor: 'm1' },
  { id: 'HK27-1065', takim: 'Kök', il: 'Şanlıurfa', tur: 'Takım', kisi: 5, tema: 'akilli', baslik: 'Uydu görüntüsüyle pamuk verim tahmini',
    problem: 'Üretici ve alıcı, hasattan önce rekolteyi bilemediği için fiyat pazarlığında zayıf kalıyor.', cozum: 'Ücretsiz uydu görüntülerinden parsel bazlı verim tahmini yapan ve üreticiye aylık rapor gönderen servis.', etiket: ['Uydu', 'Makine öğrenmesi'], oy: 98, puan: { yenilik: 8, uygulama: 7, etki: 8, surdur: 7, sunum: 8 }, mentor: 'm2' },
  { id: 'HK27-1150', takim: 'Ayaz', il: 'Malatya', tur: 'Genç çiftçi', kisi: 3, tema: 'su', baslik: 'Kayısı için don erken uyarı hattı',
    problem: 'Bahar donları bir gecede yılın emeğini yok edebiliyor.', cozum: 'Bölgesel sıcaklık sensörleri ve tahmin modeliyle don riskini 6 saat önce SMS ve sesli aramayla bildiren hat.', etiket: ['Erken uyarı', 'Sensör', 'SMS'], oy: 176, puan: { yenilik: 7, uygulama: 9, etki: 9, surdur: 8, sunum: 8 }, mentor: 'm4' },
  { id: 'HK27-1099', takim: 'İz', il: 'Gaziantep', tur: 'Girişimci', kisi: 4, tema: 'pazar', baslik: 'Coğrafi işaretli ürün için QR doğrulama',
    problem: 'Taklit ürünler hem tüketiciyi hem gerçek üreticiyi zarara uğratıyor.', cozum: 'Ambalajdaki tek kullanımlık QR ile ürünün üreticisi, parti numarası ve tescil bilgisi doğrulanır.', etiket: ['QR', 'İzlenebilirlik', 'Coğrafi işaret'], oy: 143, mentor: 'm5' },
  { id: 'HK27-1031', takim: 'Köprü', il: 'Kastamonu', tur: 'Öğrenci', kisi: 3, tema: 'genc', baslik: 'Destek programı eşleştirme asistanı',
    problem: 'Kırsaldaki genç, hangi hibe ya da desteğe uygun olduğunu bilmiyor.', cozum: 'Birkaç soruyla kişinin profiline uygun IPARD, YEG ve diğer destekleri listeleyen, başvuru takvimini hatırlatan asistan.', etiket: ['Yapay zekâ', 'Hibe', 'Mobil'], oy: 109, puan: { yenilik: 7, uygulama: 9, etki: 8, surdur: 7, sunum: 7 }, mentor: 'm3' },
  { id: 'HK27-1112', takim: 'Biyo', il: 'Balıkesir', tur: 'Takım', kisi: 4, tema: 'dongu', baslik: 'Çiftlik ölçeğinde biyogaz hesaplayıcı',
    problem: 'Hayvancılık işletmeleri biyogazın kendileri için kârlı olup olmadığını bilemiyor.', cozum: 'Hayvan sayısı ve enerji tüketimine göre kurulum maliyeti, geri dönüş süresi ve destek seçeneklerini hesaplayan araç.', etiket: ['Enerji', 'Hesaplayıcı'], oy: 76, mentor: 'm1' },
  { id: 'HK27-1077', takim: 'Arı Yolu', il: 'Ordu', tur: 'Genç çiftçi', kisi: 2, tema: 'akilli', baslik: 'Kovan sağlığı için ses analizi',
    problem: 'Kovandaki sorunlar ancak kapak açıldığında fark ediliyor; arılar strese giriyor.', cozum: 'Kovana yerleştirilen mikrofonla arı sesinden ana arı kaybı ve oğul belirtilerini tespit eden cihaz.', etiket: ['Ses analizi', 'IoT', 'Arıcılık'], oy: 158, mentor: 'm2' },
  { id: 'HK27-1135', takim: 'Sofra Yolu', il: 'Van', tur: 'Girişimci', kisi: 3, tema: 'pazar', baslik: 'Köyden şehre abonelik kutusu',
    problem: 'Yöresel ürünler mevsiminde değerinin altında satılıyor.', cozum: 'Şehirdeki tüketicinin aylık abonelikle köyden mevsim kutusu aldığı, ürün hikâyesinin QR ile anlatıldığı model.', etiket: ['Abonelik', 'E-ticaret'], oy: 91, mentor: 'm5' },
];

/* ---------- durum (localStorage) ---------- */
const DEPO = 'hk27-v1';
const varsayilan = () => ({ asama: 'basvuru', basvurular: [], oylar: {}, puanlar: {}, mentorlar: {}, finalist: null, ilk3: null });
let DURUM;
try { DURUM = Object.assign(varsayilan(), JSON.parse(localStorage.getItem(DEPO) || '{}')); } catch (e) { DURUM = varsayilan(); }
const kaydet = () => { try { localStorage.setItem(DEPO, JSON.stringify(DURUM)); } catch (e) {} };
const sifirla = () => { DURUM = varsayilan(); kaydet(); };

const tumFikirler = () => [...DURUM.basvurular, ...ORNEK];
const fikir = id => tumFikirler().find(f => f.id === id);
const oySayisi = f => (f.oy || 0) + (DURUM.oylar[f.id] ? 1 : 0);
const puanOf = f => DURUM.puanlar[f.id] || f.puan || null;
const mentorOf = f => DURUM.mentorlar[f.id] || f.mentor || null;
function agirlikli(p) {
  if (!p) return null;
  return Math.round(KRITER.reduce((t, k) => t + (p[k.id] || 0) * k.agirlik, 0)) / 10; // 0–100
}
const sirali = () => tumFikirler().map(f => ({ f, s: agirlikli(puanOf(f)) })).sort((a, b) => (b.s ?? -1) - (a.s ?? -1));
function finalistler() {
  if (DURUM.finalist) return DURUM.finalist.map(fikir).filter(Boolean);
  return sirali().filter(x => x.s != null).slice(0, 10).map(x => x.f);
}
function ilkUc() {
  if (DURUM.ilk3) return DURUM.ilk3.map(fikir).filter(Boolean);
  return finalistler().slice(0, 3);
}
function yeniKod() {
  let k; do { k = 'HK27-' + (2000 + Math.floor(Math.random() * 7999)); } while (fikir(k)); return k;
}

/* ---------- yardımcılar ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function qrSVG(metin, renk = '#14263F') {
  if (typeof qrcode === 'undefined') return '';
  const q = qrcode(0, 'M'); q.addData(metin); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2},${r + 2}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 4} ${n + 4}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="${renk}"/></svg>`;
}
const SITE = location.origin.startsWith('http') ? location.origin : 'https://yegfest-prototip.vercel.app';
function toast(m) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 400); }, 2600);
}
