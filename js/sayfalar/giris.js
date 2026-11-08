/* =====================================================================
   GİRİŞ — arka planda 3D Türkiye, yaylar Ankara'ya akar
===================================================================== */
const SAYFA = {};
SAYFA.giris = {
  ciz() {
    const y = yegler();
    $('#gSayi').innerHTML = [[y.length, 'YEG'], [yayinda().length, 'yayındaki ilçe sayfası'], [7, 'bölge'], [PLAN.slotlar.length + PLAN.pilot.length, 'festival stantı']]
      .map(([n, l]) => `<div><b data-to="${n}">0</b><span>${l}</span></div>`).join('');
    $$('#gSayi [data-to]').forEach(sayac);
    $('#gKart').innerHTML = [
      ['salon', 'salon', 'Festivalde', 'Festival salonu', '155 stantlı 3D salonu gezin, pilot stantlarda QR okutun, pasaportunuza damga toplayın.', 'Salona gir →'],
      ['harita', 'harita', 'Yıl boyu', 'Genel harita', 'Türkiye\'deki bütün YEG\'leri 3D haritada görün; ilçe sayfalarına, ürün ve hikâyelere ulaşın.', 'Haritayı aç →'],
      ['yonetim', 'yonetim', 'Bakanlık ve YEG\'ler', 'Yönetim paneli', 'İçerik onay akışı, YEG listesi, stant yerleşimi, yayın takvimi ve QR yönetimi tek ekranda.', 'Paneli aç →']
    ].map(([v, i, s, h, p, g]) => `<button class="gk" data-v="${v}"><div class="ic">${ik(i, 26)}</div><small>${s}</small><h3>${h}</h3><p>${p}</p><div class="go">${g}</div></button>`).join('');
    $$('#gKart [data-v]').forEach(b => b.onclick = () => git(b.dataset.v));
    haritaKur($('#girisHarita'), { onSec: id => git('harita/' + id) }).then(t => {
      if (!t) return; t.o.etiket = innerWidth >= 900; t.filtre(null); t.renkModu('bolge'); t.secili = null; t.akis(true);
      const dar = innerWidth < 900; dar ? t.bakis(0, 16, 15, 0, 0, 1.6) : t.bakis(-4.6, 12, 12.8, -4.6, 0, .9);
    });
  }
};
