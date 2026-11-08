/* =====================================================================
   Yönlendirme
   #giris · #salon · #harita[/yegId] · #yonetim[/modul] · #ilce-<k> · /ilce/<k>
   Eski adresler (#intro, #fest, #home, #admin) yenilerine yönlenir.
===================================================================== */
const ESKI = { intro: 'giris', fest: 'salon', home: 'harita', admin: 'yonetim' };
let YUMUSAK = false, sonRota = null;
function git(h) { if (location.hash === '#' + h) rota(); else location.hash = h; }
function goster(v) {
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('#persp button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
}
function rota() {
  let h = location.hash.slice(1) || 'giris';
  if (ESKI[h]) { history.replaceState(null, '', '#' + ESKI[h]); h = ESKI[h]; }
  if (h.startsWith('ilce-') && D[h.slice(5)]) { openFull(h.slice(5)); return; }
  const [v, alt] = h.split('/'), sayfa = SAYFA[v] ? v : 'giris';
  YUMUSAK = sonRota && sonRota.split('/')[0] === sayfa; sonRota = h;
  if (!YUMUSAK) scrollTo(0, 0);
  if (sayfa !== 'salon') stopSpeak?.();
  goster(sayfa); SAYFA[sayfa].ciz(alt);
  drawHud();
}
window.addEventListener('hashchange', rota);

/* üst çubuk */
$('#persp').innerHTML = [['salon', 'salon', 'Festival salonu'], ['harita', 'harita', 'Genel harita'], ['yonetim', 'yonetim', 'Yönetim paneli']].map(([v, i, l]) => `<button data-v="${v}" title="${l}">${ik(i, 15)}<span class="pl">${l}</span></button>`).join('');
$$('#persp button').forEach(b => b.onclick = () => git(b.dataset.v));
$('#home').onclick = () => { if (document.body.classList.contains('direct')) location.href = '/'; else git('giris'); };
$('#pclose').onclick = closePhone;
$('#phoneWrap').addEventListener('click', e => { if (e.target.id === 'phoneWrap') closePhone(); });
$('#pfull').onclick = () => { const k = phoneK; closePhone(); openFull(k); };
addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#phoneWrap').classList.contains('on')) closePhone(); cekmeceKapat(); } });
$('#doneOk').onclick = () => $('#done').classList.remove('on');
if ('speechSynthesis' in window) speechSynthesis.getVoices();

/* başlangıç */
(function () {
  const m = location.pathname.match(/^\/ilce\/([a-z0-9]+)/);
  if (m && D[m[1]]) { document.body.classList.add('direct'); openFull(m[1]); drawHud(); return; }
  rota();
})();
