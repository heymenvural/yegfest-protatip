/* =====================================================================
   İlçe sayfası, sesli hikâye, telefon/QR akışı ve dijital pasaport
   (önceki sürümden korunmuştur)
===================================================================== */
function qr(k){return QR[k].replace(/width="[^"]*"/,'').replace(/height="[^"]*"/,'')}
/* ---------- HUD ---------- */
function drawHud(anim){const h=$('#hud');h.querySelectorAll('i').forEach(i=>i.remove());
  ORDER.forEach(k=>{const i=document.createElement('i');i.title=D[k].name;if(stamps.has(k)){i.className='f';i.innerHTML=D[k].emoji;if(anim!==k)i.style.animation='none'}else i.textContent='·';h.appendChild(i)});
  const ms=$('#myScans');if(ms)ms.textContent=myScans}


/* ---------- ilçe renderer ---------- */
function renderIlce(k,mode){const d=D[k];const qr=QR[k];
  const el=document.createElement('div');el.className='ip'+(mode==='full'?' full':'');el.style.setProperty('--c',d.c);el.style.setProperty('--c2',d.c2);
  el.innerHTML=`
  <div class="ih" data-bg="/img/${k}-kapak.jpg"><div class="art">${d.art}</div>
    <div class="loc">${d.name} · ${d.il} · ${d.bolge}</div><h1>${d.name}</h1><div class="tl">${d.tl}</div>
    <div class="chips">${d.chips.map(c=>`<span>${c}</span>`).join('')}</div>
    <div class="acts"><button class="btn sm lst">🔊 Hikâyeyi dinle</button></div></div>
  <nav class="itabs">${['Tanıtım','Ürünler','Hikâye','Sofra','Üretici','Video'].map((t,i)=>`<a data-t="${i}" class="${i?'':'on'}">${t}</a>`).join('')}</nav>
  <section class="isec" data-s="0"><div class="k">İlçe tanıtımı</div><h2>${d.name}'e hoş geldiniz</h2><p>${d.intro}</p>
    <div class="facts">${d.facts.map(f=>`<div><small>${f[0]}</small><b>${f[1]}</b></div>`).join('')}</div></section>
  <section class="isec" data-s="1"><div class="k">Ürünler</div><h2>Bu topraktan <em>sofraya</em></h2>
    <div class="prods">${d.prods.map(p=>`<div class="prd"><div class="pe">${p[0]}</div><div><b>${p[1]}</b><span>${p[2]}</span>${p[3]?`<div class="ci">✓ ${p[3]}</div>`:''}</div></div>`).join('')}</div></section>
  <section class="isec" data-s="2"><div class="k">Ürünün hikâyesi</div><h2>Topraktan sofraya <em>beş adım</em></h2>
    <div class="journey">${d.steps.map((s,i)=>`<div class="js" data-n="${i+1}"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
    <div class="quote">“${d.quote}”<small>Örnek içerik · gerçek üretici sözleriyle güncellenecek</small></div></section>
  <section class="isec" data-s="3"><div class="k">Yöresel sofra</div><h2>${d.recipe.name}</h2>
    <div class="rc"><h3>Malzemeler · ${d.recipe.serv}</h3><ul class="ing">${d.recipe.ing.map(i=>`<li>${i[0]}<b>${i[1]}</b></li>`).join('')}</ul></div>
    <div class="rc"><h3>Hazırlanışı</h3><ol class="stp">${d.recipe.st.map(s=>`<li>${s}</li>`).join('')}</ol></div></section>
  <section class="isec" data-s="4"><div class="k">Üretici</div><h2>Ürünün arkasındaki <em>insan</em></h2>
    <div class="prod-card"><div class="av" data-bg="/img/${k}-uretici.jpg">${d.producer[0]}</div><div><span class="tagx">Örnek profil</span><b style="display:block;color:var(--navy)">${d.producer[1]}</b><span style="font-size:13px;color:var(--muted)">${d.producer[2]} Her profil açık rıza formuyla yayımlanır.</span></div></div></section>
  <section class="isec" data-s="5"><div class="k">Video</div><h2>Bir İlçe, <em>Bir Hikâye</em></h2>
    <div class="vbox"><video controls playsinline preload="metadata" src="/img/${k}-video.mp4"></video><div class="pl">▶</div><b>60 saniyelik ilçe videosu</b><small>Pilot çekimle bu alana yerleşecek</small></div></section>
  <div class="ifoot"><b>Prototip.</b> YEGFEST dijital tanıtım platformu önerisi için hazırlanmış örnek sayfadır; resmî bir site değildir. Örnek içerikler doğrulanarak güncellenecektir.<br>Hazırlayan: Harun Eymen Vural</div>`;
  /* optional media */
  el.querySelectorAll('[data-bg]').forEach(x=>{const im=new Image();im.onload=()=>{x.style.backgroundImage=`url("${im.src}")`;if(x.classList.contains('ih'))x.classList.add('img');else x.textContent=''};im.src=x.dataset.bg});
  const v=el.querySelector('video');v.addEventListener('loadedmetadata',()=>v.parentElement.classList.add('has'));
  /* tabs */
  const tabs=[...el.querySelectorAll('.itabs a')],secs=[...el.querySelectorAll('.isec')];
  tabs.forEach(t=>t.onclick=()=>{const s=secs[+t.dataset.t];const sc=el.closest('.pscroll');const off=mode==='full'?130:60;
    if(sc)sc.scrollTo({top:s.offsetTop-off+10,behavior:'smooth'});else scrollTo({top:s.getBoundingClientRect().top+scrollY-off,behavior:'smooth'})});
  const onScroll=()=>{let i=0;secs.forEach((s,j)=>{if(s.getBoundingClientRect().top<(mode==='full'?200:180))i=j});tabs.forEach((t,j)=>t.classList.toggle('on',j===i))};
  setTimeout(()=>{const sc=el.closest('.pscroll')||window;sc.addEventListener('scroll',onScroll,{passive:true})},0);
  /* listen */
  const lb=el.querySelector('.lst');lb.onclick=()=>speak(d.story,lb);
  return el}

/* ---------- speech ---------- */
let speaking=null;
function speak(text,btn){if(!('speechSynthesis' in window)){toast('Bu tarayıcı sesli okumayı desteklemiyor');return}
  if(speaking){speechSynthesis.cancel();speaking.classList.remove('on');speaking.textContent='🔊 Hikâyeyi dinle';if(speaking===btn){speaking=null;return}}
  const u=new SpeechSynthesisUtterance(text);u.lang='tr-TR';u.rate=.95;const vs=speechSynthesis.getVoices().filter(v=>/^tr/i.test(v.lang));
  if(vs.length)u.voice=vs.find(v=>/natural|online|google/i.test(v.name))||vs[0];else toast('Türkçe ses bulunamazsa tarayıcı varsayılan sesi kullanır');
  u.onend=()=>{btn.classList.remove('on');btn.textContent='🔊 Hikâyeyi dinle';speaking=null};
  btn.classList.add('on');btn.textContent='⏹ Durdur';speaking=btn;speechSynthesis.speak(u)}
if('speechSynthesis' in window)speechSynthesis.getVoices();
function stopSpeak(){if(speaking){speechSynthesis.cancel();speaking.classList.remove('on');speaking.textContent='🔊 Hikâyeyi dinle';speaking=null}}

/* ---------- phone ---------- */
let phoneK=null;
function openPhone(k){phoneK=k;const sc=$('#screen');sc.innerHTML='';
  const sw=document.createElement('div');sw.className='pscroll';sw.appendChild(renderIlce(k,'phone'));sc.appendChild(sw);
  const scan=document.createElement('div');scan.className='scan';scan.innerHTML=`<div class="vf">${qr(k)}<div class="line"></div></div><p>QR kod okunuyor…</p><div class="okb">✓ ${D[k].name} · pasaporta damga eklendi</div>`;sc.appendChild(scan);
  $('#phoneWrap').classList.add('on');
  setTimeout(()=>{scan.classList.add('ok');scan.querySelector('p').textContent='Okundu';myScans++;const first=!stamps.has(k);stamps.add(k);save();drawHud(first?k:null);window.salonDamga?.(k);yonetimOlay?.('qr',D[k].name+' standında QR okutuldu (sizin)');
    setTimeout(()=>{scan.style.opacity=0;setTimeout(()=>scan.remove(),500);if(first&&stamps.size===3)setTimeout(celebrate,900)},1100)},1700)}
function closePhone(){stopSpeak();$('#phoneWrap').classList.remove('on');window.salonTelefonKapandi?.()}
$('#pclose').onclick=closePhone;
$('#phoneWrap').addEventListener('click',e=>{if(e.target.id==='phoneWrap')closePhone()});
$('#pfull').onclick=()=>{const k=phoneK;closePhone();openFull(k)};
addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#phoneWrap').classList.contains('on'))closePhone()});
function celebrate(){$('#done').classList.add('on');const cs=['#C9A227','#2E78C7','#E07B1F','#7B4FA0','#5E8C4A'];
  for(let i=0;i<90;i++){const c=document.createElement('i');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=cs[i%5];c.style.animationDuration=(2+Math.random()*2.5)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),5500)}}
$('#doneOk').onclick=()=>$('#done').classList.remove('on');

/* ---------- full ilçe ---------- */
function openFull(k){const f=$('#ilceFull');f.innerHTML='';f.appendChild(renderIlce(k,'full'));goster('ilce');
  if(!document.body.classList.contains('direct'))history.replaceState(null,'','#ilce-'+k)}

