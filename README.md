# YEGFEST · Dijital Platform Simülasyonu (prototip)

YEGFEST dijital tanıtım platformu önerisinin tıklanabilir prototipi. Tek bir platformda üç görünüm:

| Adres | Görünüm |
|---|---|
| `#giris` | Giriş: arka planda 3D Türkiye, bütün YEG'lerden Ankara'ya akan yaylar |
| `#salon` | **Festival salonu (3D):** 7 bölge alanında 152 stant + 3 pilot stant, mini harita, sinematik tur, QR okutma ve dijital pasaport |
| `#harita` · `#harita/<id>` | **Genel harita (3D):** 155 YEG, bölge / içerik aşaması renklendirmesi, filtre, arama, YEGFEST'e akış |
| `#yonetim/<modül>` | **Yönetim paneli:** `genel`, `icerik` (sürükle-bırak onay akışı), `yegler` (tablo, CSV içe/dışa aktarma), `stant` (yerleşim + 3D önizleme), `takvim`, `qr` (QR kartı üretme/yazdırma, analitik) |
| `/ilce/<slug>` | İlçe sayfası (QR kodlarının açtığı adres): `buharkent`, `safranbolu`, `finike` |

Eski adresler (`#intro`, `#fest`, `#home`, `#admin`) yenilerine yönlenir; basılı QR kodları değişmeden çalışır.

> **Prototip · resmî site değildir.** Pilot ilçe içerikleri sunum amaçlıdır. 152 YEG **temsilî konumla** gösterilir; gerçek liste *Yönetim › YEG'ler › CSV içe aktar* ile yüklendiğinde harita, salon ve panel gerçek veriyle çalışır. Panel verileri temsilîdir. Değişiklikler yalnızca tarayıcıda (`localStorage`) tutulur.

## Gerçek YEG listesini yüklemek

CSV sütunları (noktalı virgül veya virgül): `ad;il;ilce;enlem;boylam;asama`. Yalnızca `ad` ve `il` zorunludur; konum yoksa il merkezi kullanılır, bölge ilden otomatik bulunur. Şablon panelden indirilebilir.

## Klasör yapısı

```
index.html              uygulama kabuğu
css/temel.css           önceki sürümden korunan stiller (ilçe sayfası, telefon, pasaport)
css/app.css             yeni arayüz
js/ilce-veri.js         pilot ilçe içerikleri ve gerçek QR kodları
js/turkiye-veri.js      Türkiye sınırı, bölge nokta dokusu, 81 il merkezi, il→ilçe listesi
js/model.js             veri modeli: YEG'ler, içerik aşamaları, salon planı, yerleşim, takvim
js/ilce.js              ilçe sayfası, sesli hikâye, telefon/QR akışı, pasaport
js/3d/turkiye.js        Three.js 3D Türkiye haritası
js/3d/fuar.js           Three.js 3D festival salonu
js/sayfalar/            giriş, salon, harita
js/yonetim/             yönetim paneli modülleri
vendor/                 three.js 0.160, OrbitControls, qrcode-generator (yerel kopya)
img/                    isteğe bağlı ilçe görselleri/videoları (bkz. img/README.txt)
```

## Yerelde çalıştırma

```bash
npx serve .        # /ilce/ derin bağlantıları için Vercel'de rewrite tanımlıdır
```

Veri kaynakları: ülke sınırları world-atlas (Natural Earth, kamu malı); il/ilçe listesi turkey-neighbourhoods (MIT).
