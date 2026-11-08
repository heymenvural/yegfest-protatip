/* =====================================================================
   Yönetim › Yayın takvimi
===================================================================== */
let tkAy = (() => { const d = new Date(); return [d.getFullYear(), d.getMonth()]; })();
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
YON.takvim = {
  ciz() {
    return yKafa('', 'Yayın <em>takvimi</em>', 'Her hafta yeni ilçe içerikleri: Salı “Bir İlçe, Bir Hikâye”, Çarşamba “Yöresel Sofra”, ay sonu belgesel. Bir güne tıklayarak yayın ekleyin.',
      `<button class="btn sm ghost" id="tkOnce">←</button><b id="tkBas" style="min-width:140px;text-align:center;color:var(--navy)"></b><button class="btn sm ghost" id="tkSonra">→</button><button class="btn sm" id="tkBugun">Bugün</button>`) +
      `<div class="kart pad"><div class="takvim" id="tk"></div></div>`;
  },
  sonra() {
    tkCiz();
    $('#tkOnce').onclick = () => { tkAy = tkAy[1] ? [tkAy[0], tkAy[1] - 1] : [tkAy[0] - 1, 11]; tkCiz(); };
    $('#tkSonra').onclick = () => { tkAy = tkAy[1] < 11 ? [tkAy[0], tkAy[1] + 1] : [tkAy[0] + 1, 0]; tkCiz(); };
    $('#tkBugun').onclick = () => { const d = new Date(); tkAy = [d.getFullYear(), d.getMonth()]; tkCiz(); };
  }
};
const gunAnahtar = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
function tkCiz() {
  const [y, m] = tkAy, ilk = (new Date(y, m, 1).getDay() + 6) % 7, gun = new Date(y, m + 1, 0).getDate(), bug = new Date();
  $('#tkBas').textContent = AYLAR[m] + ' ' + y;
  let h = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(g => `<div class="gb">${g}</div>`).join('');
  for (let i = 0; i < ilk; i++) h += '<div class="tg dis"></div>';
  for (let d = 1; d <= gun; d++) {
    const k = gunAnahtar(y, m, d), l = S.takvim[k] || [], b = bug.getFullYear() === y && bug.getMonth() === m && bug.getDate() === d;
    h += `<div class="tg ${b ? 'bugun' : ''}" data-k="${k}"><span class="n" style="background:none;padding:0;color:var(--navy);font-size:12px;font-weight:800">${d}</span>${l.map((e, i) => `<span class="${e.k ? 'p' : ''}" title="${esc(e.t)}">${esc(e.t)}</span>`).join('')}</div>`;
  }
  $('#tk').innerHTML = h;
  $$('#tk .tg[data-k]').forEach(t => t.onclick = () => tkGun(t.dataset.k));
}
function tkGun(k) {
  const l = S.takvim[k] || [], [yy, mm, dd] = k.split('-');
  const m = modal({ baslik: `${+dd} ${AYLAR[+mm - 1]} ${yy}`, govde: `
    ${l.length ? `<div style="margin-bottom:12px">${l.map((e, i) => `<div class="yatay" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span>${esc(e.t)}</span><button class="btn sm ghost" data-sil="${i}">Sil</button></div>`).join('')}</div>` : '<p style="color:var(--muted);font-size:14px;margin-bottom:12px">Bu gün için yayın yok.</p>'}
    <label class="alan">YEG<select id="tkY">${yegSecenek()}</select></label>
    <label class="alan">İçerik<select id="tkT"><option>Bir İlçe, Bir Hikâye</option><option>Yöresel Sofra</option><option>Ürünün Yolculuğu</option><option>Üretici portresi</option><option>İlçe sayfası</option></select></label>`,
    eylem: `<button class="btn ghost sm" data-k>Kapat</button><button class="btn gold sm" id="tkEkle">Yayın ekle</button>` });
  $$('[data-sil]', m.el).forEach(b => b.onclick = () => { l.splice(+b.dataset.sil, 1); S.takvim[k] = l; kaydet(); m.kapat(); tkCiz(); });
  $('#tkEkle', m.el).onclick = () => { const y = yeg($('#tkY', m.el).value); (S.takvim[k] ??= []).push({ t: `${y.ad} · ${$('#tkT', m.el).value}`, k: y.pilot ? y.id : null }); kaydet(); m.kapat(); tkCiz(); yonetimOlay('takvim', `<b>${esc(y.ad)}</b> yayını ${+dd} ${AYLAR[+mm - 1]} tarihine eklendi`); toast('✓ Takvime eklendi'); };
}
