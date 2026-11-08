/* =====================================================================
   YEGFEST · 3D Festival salonu (Three.js)
   - 7 bölge alanında 152 YEG stantı (InstancedMesh), pilot meydanında
     3 ayrıntılı pilot stant (QR panosu okutulabilir)
   - Sahne + LED ekran, bilgi masası, tadım alanı, gezinen ziyaretçiler
   - Stant seçimi, kameranın stanta uçuşu, sinematik tur, yerleşim güncelleme
===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from '../../vendor/addons/OrbitControls.js';

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: .02, ...o });

function tuval(w, h, ciz) { const c = document.createElement('canvas'); c.width = w; c.height = h; ciz(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function yazi(x, metin, px, ag, y, w, renk = '#fff', hiza = 'center') { x.fillStyle = renk; x.textAlign = hiza; x.textBaseline = 'middle'; x.font = `${ag} ${px}px ${FONT}`; x.fillText(metin, hiza === 'center' ? w / 2 : 30, y, w - 40); }
function svgResim(svg) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); let x = svg.replace(/width="[^"]*"/, 'width="512"').replace(/height="[^"]*"/, 'height="512"'); if (!/xmlns=/.test(x)) x = x.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(x); }); }

export class Fuar {
  constructor(kap, o = {}) {
    this.o = Object.assign({ plan: null, ilce: {}, qr: {}, slotYeg: () => null, bolgeRenk: {}, onSlot: null, onPilot: null, onKamera: null, insan: 150, zoom: true }, o);
    this.kok = document.createElement('div'); this.kok.className = 'fuar-kok'; this.kok.style.cssText = 'position:absolute;inset:0;overflow:hidden';
    kap.appendChild(this.kok);
    this.saat = new THREE.Clock(); this.zaman = 0; this.anim = [];
    this.kur();
  }
  kur() {
    const rd = this.rd = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rd.setPixelRatio(Math.min(devicePixelRatio, 2)); rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
    rd.outputColorSpace = THREE.SRGBColorSpace; rd.toneMapping = THREE.ACESFilmicToneMapping; rd.toneMappingExposure = 1.05;
    rd.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:pan-y';
    this.kok.appendChild(rd.domElement);
    const s = this.sahne = new THREE.Scene(); s.fog = new THREE.Fog(0x15253D, 90, 190);
    this.kam = new THREE.PerspectiveCamera(40, 1, .5, 400); this.kam.position.set(-8, 62, 64);
    const k = this.kontrol = new OrbitControls(this.kam, rd.domElement);
    k.enableDamping = true; k.dampingFactor = .07; k.maxPolarAngle = 1.36; k.minPolarAngle = .2; k.minDistance = 6; k.maxDistance = 110; k.target.set(-3, 0, -2); k.enableZoom = this.o.zoom;
    k.addEventListener('start', () => { this.turDur(); this.kamHedef = null; });

    s.add(new THREE.HemisphereLight(0xffffff, 0xCDBF9F, 1.05));
    const g = new THREE.DirectionalLight(0xFFF4E0, 1.5); g.position.set(30, 60, 30); g.castShadow = true; g.shadow.mapSize.set(2048, 2048);
    Object.assign(g.shadow.camera, { left: -62, right: 62, top: 45, bottom: -45, near: 1, far: 160 }); g.shadow.bias = -.0005; g.shadow.normalBias = .03; s.add(g);
    // üstten sıcak spotlar hissi
    [[-30, -12], [5, -12], [35, -12], [9, 12]].forEach(([x, z]) => { const p = new THREE.PointLight(0xFFE2A8, 30, 40, 2); p.position.set(x, 14, z); s.add(p); });

    this.zemin(); this.alanlar(); this.stantlar(); this.pilotlar(); this.sahneKur(); this.donatilar(); this.insanlar();

    this.etiketKat = document.createElement('div'); this.etiketKat.className = 'fuar-etiketler'; this.kok.appendChild(this.etiketKat);
    this.ipucu = document.createElement('div'); this.ipucu.className = 'fuar-ipucu'; this.kok.appendChild(this.ipucu);
    this.ray = new THREE.Raycaster(); this.fare = new THREE.Vector2();
    const el = rd.domElement; let bas = null;
    el.addEventListener('pointerdown', e => bas = [e.clientX, e.clientY]);
    el.addEventListener('pointerup', e => { if (bas && Math.hypot(e.clientX - bas[0], e.clientY - bas[1]) < 6) this.tikla(e); bas = null; });
    el.addEventListener('pointermove', e => { if (bas && e.buttons) { this.ipucu.classList.remove('on'); return; } this.uzerinde(e); });
    el.addEventListener('pointerleave', () => { this.ipucu.classList.remove('on'); this.hover(-1); });
    this.ro = new ResizeObserver(() => this.boyut()); this.ro.observe(this.kok);
    this.io = new IntersectionObserver(e => { this.gorunur = e[0].isIntersecting; if (this.gorunur) this.baslat(); }); this.io.observe(this.kok);
    this.boyut(); this.baslat();
  }

  /* ---------- Yapı ---------- */
  zemin() {
    const { x0, x1, z0, z1 } = this.o.plan.sinir, w = x1 - x0 + 6, d = z1 - z0 + 6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    this.merkez = new THREE.Vector3(cx, 0, cz);
    const z = new THREE.Mesh(new THREE.BoxGeometry(w, .4, d), M(0xEFE8D8)); z.position.set(cx, -.2, cz); z.receiveShadow = true; this.sahne.add(z);
    const kenar = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, .3, d + 1.4), M(0x1F3A5F)); kenar.position.set(cx, -.45, cz); this.sahne.add(kenar);
    // koridor şeridi
    const kor = new THREE.Mesh(new THREE.PlaneGeometry(w - 4, 11), M(0xE4D9C0)); kor.rotation.x = -Math.PI / 2; kor.position.set(cx, .01, -7); kor.receiveShadow = true; this.sahne.add(kor);
    // arka duvar + dev yazı
    const duvar = new THREE.Mesh(new THREE.BoxGeometry(w, 9, .5), M(0x18304F)); duvar.position.set(cx, 4.5, z0 - 3); duvar.receiveShadow = true; this.sahne.add(duvar);
    const yaz = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ transparent: true, map: tuval(1600, 320, (x, W, H) => {
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 200px ${FONT}`; const a = x.measureText('YEG').width, b = x.measureText('FEST').width, s0 = W / 2 - (a + b) / 2;
      x.textAlign = 'left'; x.fillStyle = '#fff'; x.fillText('YEG', s0, 130); x.fillStyle = '#E3B341'; x.fillText('FEST', s0 + a, 130);
      x.textAlign = 'center'; x.font = `italic 600 64px Fraunces, Georgia, serif`; x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText('155 ilçe · tek çatı', W / 2, 265);
    }) }));
    yaz.position.set(cx, 5, z0 - 2.7); this.sahne.add(yaz);
    // bayrak süsleri
    const renk = [0xE3B341, 0xE0735F, 0x2E78C7, 0x5E8C4A];
    for (let i = 0; i < 46; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.5, 1, 3), M(renk[i % 4])); b.rotation.x = Math.PI; b.position.set(x0 + 1 + i * (w - 6) / 45, 8.2, z0 - 2.6); this.sahne.add(b); }
  }
  alanlar() {
    this.o.plan.alanlar.forEach(a => {
      const c = new THREE.Color(a.renk);
      const hal = new THREE.Mesh(new THREE.PlaneGeometry(a.w, a.d), M(c.clone().lerp(new THREE.Color(0xF3EEE2), .78))); hal.rotation.x = -Math.PI / 2; hal.position.set(a.x + a.w / 2, .015, a.z + a.d / 2); hal.receiveShadow = true; this.sahne.add(hal);
      const cer = new THREE.Mesh(new THREE.PlaneGeometry(a.w, .35), new THREE.MeshBasicMaterial({ color: c })); cer.rotation.x = -Math.PI / 2; cer.position.set(a.x + a.w / 2, .02, a.z + a.d + .17); this.sahne.add(cer);
      // asılı bölge tabelası
      const t = new THREE.Mesh(new THREE.BoxGeometry(9, 1.8, .15), [M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff),
        new THREE.MeshBasicMaterial({ map: tuval(900, 180, (x, W, H) => { x.fillStyle = a.renk; x.fillRect(0, 0, W, H); yazi(x, a.bolge, 96, '800', H / 2, W); }) }),
        new THREE.MeshBasicMaterial({ map: tuval(900, 180, (x, W, H) => { x.fillStyle = a.renk; x.fillRect(0, 0, W, H); yazi(x, a.bolge, 96, '800', H / 2, W); }) })]);
      t.position.set(a.x + a.w / 2, 6.4, a.z + a.d / 2); this.sahne.add(t);
      const ip = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 3, 4), M(0x777777)); ip.position.set(a.x + a.w / 2, 8.6, a.z + a.d / 2); this.sahne.add(ip);
    });
  }
  stantlar() {
    const sl = this.o.plan.slotlar, n = sl.length, W = 2.6, Dd = 2.3;
    const geo = {
      taban: new THREE.BoxGeometry(W, .06, Dd), arka: new THREE.BoxGeometry(W, 2.1, .07), yan: new THREE.BoxGeometry(.06, 2.1, Dd),
      fas: new THREE.BoxGeometry(W, .42, .09), tez: new THREE.BoxGeometry(W * .62, .9, .45), sec: new THREE.BoxGeometry(W, 2.6, Dd), urun: new THREE.BoxGeometry(.24, .2, .2)
    };
    const im = (g, m, c, golge = true) => { const x = new THREE.InstancedMesh(g, m, c); x.castShadow = golge; x.receiveShadow = true; this.sahne.add(x); return x; };
    this.ins = {
      taban: im(geo.taban, M(0xF6F1E4), n, false), arka: im(geo.arka, M(0xffffff), n), yan: im(geo.yan, M(0xffffff), n * 2),
      fas: im(geo.fas, M(0xffffff, { roughness: .5 }), n), tez: im(geo.tez, M(0xffffff), n), urun: im(geo.urun, M(0xffffff), n * 3),
      sec: im(geo.sec, new THREE.MeshBasicMaterial({ visible: false }), n, false)
    };
    const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s1 = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), o = new THREE.Vector3();
    const koy = (mesh, i, sl, ox, oy, oz) => {
      e.set(0, sl.yon === 1 ? 0 : Math.PI, 0); q.setFromEuler(e);
      o.set(ox, oy, oz).applyQuaternion(q); p.set(sl.x, 0, sl.z).add(o); mt.compose(p, q, s1); mesh.setMatrixAt(i, mt);
    };
    sl.forEach((x, i) => {
      koy(this.ins.taban, i, x, 0, .03, 0); koy(this.ins.arka, i, x, 0, 1.05, -Dd / 2);
      koy(this.ins.yan, i * 2, x, -W / 2, 1.05, 0); koy(this.ins.yan, i * 2 + 1, x, W / 2, 1.05, 0);
      koy(this.ins.fas, i, x, 0, 2.3, Dd / 2 - .05); koy(this.ins.tez, i, x, 0, .45, Dd / 2 - .5); koy(this.ins.sec, i, x, 0, 1.3, 0);
      for (let u = 0; u < 3; u++) koy(this.ins.urun, i * 3 + u, x, -.45 + u * .45, 1.0, Dd / 2 - .5);
    });
    Object.values(this.ins).forEach(m => m.instanceMatrix.needsUpdate = true);
    this.renkle();
  }
  renkle() {
    const c = new THREE.Color(), bos = new THREE.Color(0xD8D2C4), ur = [0xC9A227, 0x7A5E3A, 0x5E8C4A, 0xB4543F, 0x8A6FB0, 0xE07B1F];
    this.o.plan.slotlar.forEach((sl, i) => {
      const y = this.o.slotYeg(sl.id), r = new THREE.Color(this.o.bolgeRenk[sl.bolge]);
      c.copy(y ? r : bos); if (i === this.hoverI) c.lerp(new THREE.Color(0xffffff), .45); if (sl.id === this.seciliSlot) c.set(0xE3B341);
      this.ins.fas.setColorAt(i, c);
      this.ins.tez.setColorAt(i, y ? r.clone().lerp(new THREE.Color(0xffffff), .55) : bos);
      for (let u = 0; u < 3; u++) this.ins.urun.setColorAt(i * 3 + u, y ? new THREE.Color(ur[(i + u * 2) % 6]) : bos);
    });
    this.ins.fas.instanceColor.needsUpdate = true; this.ins.tez.instanceColor.needsUpdate = true; this.ins.urun.instanceColor.needsUpdate = true;
  }
  async pilotlar() {
    this.pilot = [];
    for (const p of this.o.plan.pilot) {
      const d = this.o.ilce[p.k], g = new THREE.Group(); g.position.set(p.x, 0, p.z); this.sahne.add(g);
      const W = 4.6, Dd = 3.6, c = new THREE.Color(d.c), c2 = new THREE.Color(d.c2);
      const taban = new THREE.Mesh(new THREE.BoxGeometry(W + .4, .12, Dd + .4), M(0xF4E7C4)); taban.position.y = .06; taban.receiveShadow = true;
      const arka = new THREE.Mesh(new THREE.BoxGeometry(W, 3.2, .12), new THREE.MeshStandardMaterial({ map: tuval(900, 640, (x, w, h) => {
        const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, d.c); gr.addColorStop(1, d.c2); x.fillStyle = gr; x.fillRect(0, 0, w, h);
        x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `800 30px ${FONT}`; x.textAlign = 'left'; x.fillText((d.il + ' · ' + d.bolge).toUpperCase(), 50, h - 170);
        x.fillStyle = '#fff'; x.font = `italic 600 62px Fraunces, Georgia, serif`; x.fillText(d.tl, 50, h - 100, w - 100);
        x.font = `200px ${FONT}`; x.textAlign = 'right'; x.fillText(typeof d.art === 'string' && !d.art.startsWith('<') ? d.art : '', w - 40, 230);
      }), roughness: .6 }));
      arka.position.set(0, 1.6, -Dd / 2); arka.castShadow = arka.receiveShadow = true;
      const yanM = M(c2), yanL = new THREE.Mesh(new THREE.BoxGeometry(.1, 3.2, Dd), yanM); yanL.position.set(-W / 2, 1.6, 0); yanL.castShadow = true; const yanR = yanL.clone(); yanR.position.x = W / 2;
      const bas = new THREE.Mesh(new THREE.BoxGeometry(W + .3, .7, .14), [M(c), M(c), M(c), M(c), new THREE.MeshBasicMaterial({ map: tuval(900, 140, (x, w, h) => { x.fillStyle = d.c; x.fillRect(0, 0, w, h); yazi(x, d.name.toUpperCase() + '  ·  YEG', 78, '800', h / 2, w); }) }), M(c)]);
      bas.position.set(0, 3.55, Dd / 2); bas.castShadow = true;
      const dir = new THREE.Mesh(new THREE.BoxGeometry(.12, 3.5, .12), M(0xE9E2D0)); dir.position.set(-W / 2 - .05, 1.75, Dd / 2); const dir2 = dir.clone(); dir2.position.x = W / 2 + .05;
      const tez = new THREE.Mesh(new THREE.BoxGeometry(W * .8, 1, .7), [M(0xFBF7EE), M(0xFBF7EE), M(0xE9E0CC), M(0xFBF7EE), new THREE.MeshStandardMaterial({ map: tuval(800, 180, (x, w, h) => { x.fillStyle = '#FBF7EE'; x.fillRect(0, 0, w, h); x.fillStyle = '#C9A227'; x.fillRect(0, 0, w, 16); yazi(x, d.chips[0].toUpperCase(), 64, '800', h / 2 + 8, w, '#1F3A5F'); }) }), M(0xFBF7EE)]);
      tez.position.set(0, .5, Dd / 2 - .7); tez.castShadow = tez.receiveShadow = true;
      g.add(taban, arka, yanL, yanR, bas, dir, dir2, tez);
      // ürün emojileri
      d.prodE.forEach((em, j) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
        sp.position.set(-1.2 + j * 1.2, 1.38, Dd / 2 - .7); sp.scale.setScalar(.75); g.add(sp);
        if (em.startsWith('<svg')) svgResim(em).then(im => { if (im) sp.material.map = tuval(256, 256, x => x.drawImage(im, 16, 16, 224, 224)), sp.material.needsUpdate = true; });
        else { sp.material.map = tuval(256, 256, (x, w, h) => { x.font = `200px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(em, w / 2, h / 2 + 10); }); }
      });
      // QR panosu
      const qrMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const qr = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.45, .06), [M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff), qrMat, M(0xffffff)]);
      qr.position.set(1.45, 2.05, Dd / 2 - .25); qr.rotation.y = -.25; qr.castShadow = true; g.add(qr);
      svgResim(this.o.qr[p.k]).then(im => { qrMat.map = tuval(300, 400, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (im) x.drawImage(im, 24, 24, 252, 252); yazi(x, 'OKUT · DİNLE', 34, '800', 330, w, '#1F3A5F'); }); qrMat.needsUpdate = true; });
      const qrHalka = new THREE.Mesh(new THREE.RingGeometry(.85, .95, 40), new THREE.MeshBasicMaterial({ color: 0xE3B341, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      qrHalka.position.copy(qr.position); qrHalka.position.z += .05; qrHalka.rotation.y = -.25; g.add(qrHalka);
      // işaret ışığı
      const isik = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 14, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFD45E, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      isik.position.y = 7; g.add(isik);
      const sec = new THREE.Mesh(new THREE.BoxGeometry(W + .4, 4, Dd + .4), new THREE.MeshBasicMaterial({ visible: false })); sec.position.y = 2; sec.userData.pilot = p.k; g.add(sec);
      this.pilot.push({ ...p, g, qr, qrHalka, isik, sec });
    }
  }
  sahneKur() {
    const sh = this.o.plan.sahne;
    const p = new THREE.Mesh(new THREE.BoxGeometry(sh.w, 1, sh.d), M(0x14263F)); p.position.set(sh.x, .5, sh.z); p.castShadow = p.receiveShadow = true; this.sahne.add(p);
    const c = document.createElement('canvas'); c.width = 1400; c.height = 300; this.led = c; this.ledT = new THREE.CanvasTexture(c); this.ledT.colorSpace = THREE.SRGBColorSpace;
    const ekran = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.8), new THREE.MeshBasicMaterial({ map: this.ledT, toneMapped: false })); ekran.position.set(sh.x, 3.9, sh.z - sh.d / 2 + .25); this.sahne.add(ekran);
    const cer = new THREE.Mesh(new THREE.BoxGeometry(13.5, 3.3, .25), M(0x0F1E33)); cer.position.set(sh.x, 3.9, sh.z - sh.d / 2 + .05); this.sahne.add(cer);
    this.spot = [-4.5, 0, 4.5].map((dx, i) => { const k = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 28, 1, true), new THREE.MeshBasicMaterial({ color: i === 1 ? 0x9CC3EE : 0xFFD45E, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); k.position.set(sh.x + dx, 4, sh.z - .2); this.sahne.add(k); return k; });
    this.ledCiz(0);
  }
  ledCiz(t) {
    const x = this.led.getContext('2d'), w = this.led.width, h = this.led.height, g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#14263F'); g.addColorStop(.5, '#1F3A5F'); g.addColorStop(1, '#14263F'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.font = `800 110px ${FONT}`; x.textBaseline = 'middle'; const m = 'YEGFEST  ·  155 ilçe · tek çatı  ·  QR okut, hikâyeyi dinle  ·  ', mw = x.measureText(m).width, of = (t * 140) % mw;
    x.fillStyle = '#E3B341'; for (let i = -1; i < 3; i++) x.fillText(m, i * mw - of, h / 2);
    x.fillStyle = 'rgba(0,0,0,.2)'; for (let y = 0; y < h; y += 5) x.fillRect(0, y, w, 1.5); this.ledT.needsUpdate = true;
  }
  donatilar() {
    // bilgi masası
    const b = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.05, 32, 1, false, 0, Math.PI * 1.4), M(0x1F3A5F)); b.position.set(-12, .52, -7); b.castShadow = true; this.sahne.add(b);
    const bt = new THREE.Mesh(new THREE.BoxGeometry(5, 1.1, .1), new THREE.MeshBasicMaterial({ map: tuval(600, 130, (x, w, h) => { x.fillStyle = '#E3B341'; x.fillRect(0, 0, w, h); yazi(x, 'BİLGİ · PASAPORT', 62, '800', h / 2, w, '#14263F'); }) }));
    bt.position.set(-12, 3.4, -7); this.sahne.add(bt);
    // dinlenme alanı
    for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .08, 20), M(0xffffff)); t.position.set(-32 + i * 3.2 + (i % 2) * .6, .75, -7 + (i % 2 ? 1.6 : -1.6)); t.castShadow = true; this.sahne.add(t);
      const a = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .72, 6), M(0x888888)); a.position.set(t.position.x, .36, t.position.z); this.sahne.add(a); }
    // tadım tezgâhları
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(4, .9, 1), M(0xA0784E)); m.position.set(22 + i * 5, .45, -7); m.castShadow = m.receiveShadow = true; this.sahne.add(m); }
    const tt = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, .1), new THREE.MeshBasicMaterial({ map: tuval(800, 120, (x, w, h) => { x.fillStyle = '#5E8C4A'; x.fillRect(0, 0, w, h); yazi(x, 'TADIM ALANI', 64, '800', h / 2, w); }) }));
    tt.position.set(29.5, 3.4, -7); this.sahne.add(tt);
  }
  insanlar() {
    const n = this.o.insan, { x0, x1 } = this.o.plan.sinir;
    this.alan = [[x0 + 3, x1 - 3, -11.5, -2.5], [1.5, 17, 10.5, 19.5], [-28.4, -24.6, -12, 25], [-5.2, -.9, -30, 25], [18.8, 23.2, -30, 25], [x0 + 3, x1 - 3, 26, 28]];
    const gov = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.2, .55, 4, 8), M(0xffffff), n), bas = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 10, 8), M(0xffffff), n);
    gov.castShadow = true; bas.castShadow = true; this.sahne.add(gov, bas); this.gov = gov; this.basM = bas;
    const renk = [0x1F3A5F, 0xC9A227, 0x5E8C4A, 0xB4543F, 0x2E78C7, 0x7A3D8C, 0x3E4C5E, 0xD98C5F, 0x8DB0D3], ten = [0xE8C5A0, 0xC99A72, 0x9C6B48, 0xF1D4B5];
    this.kisi = [];
    for (let i = 0; i < n; i++) {
      gov.setColorAt(i, new THREE.Color(renk[i % 9])); bas.setColorAt(i, new THREE.Color(ten[i % 4]));
      const a = Math.floor(Math.random() * this.alan.length), p = this.nokta(a);
      this.kisi.push({ p, a, yol: [], hiz: 1 + Math.random() * .8, bekle: Math.random() * 3, faz: Math.random() * 6, yon: 0, b: .85 + Math.random() * .3 });
    }
  }
  nokta(a) { const [x0, x1, z0, z1] = this.alan[a]; return new THREE.Vector3(x0 + Math.random() * (x1 - x0), 0, z0 + Math.random() * (z1 - z0)); }
  yolBul(k) {
    const yeni = Math.random() < .5 ? k.a : Math.floor(Math.random() * this.alan.length), h = this.nokta(yeni), y = [];
    if (yeni !== k.a) { const kz = -7 + (Math.random() - .5) * 6; y.push(new THREE.Vector3(Math.min(Math.max(k.p.x, this.alan[0][0]), this.alan[0][1]), 0, kz), new THREE.Vector3(h.x, 0, kz)); }
    y.push(h); k.yol = y; k.a = yeni;
  }

  /* ---------- Etkileşim ---------- */
  isin(e) {
    const r = this.rd.domElement.getBoundingClientRect();
    this.fare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.fare, this.kam);
    const h = this.ray.intersectObjects([this.ins.sec, ...this.pilot.map(p => p.sec)], false)[0];
    if (!h) return null;
    if (h.object.userData.pilot) return { pilot: h.object.userData.pilot };
    return { i: h.instanceId, slot: this.o.plan.slotlar[h.instanceId] };
  }
  hover(i) { if (this.hoverI === i) return; this.hoverI = i; this.renkle(); }
  uzerinde(e) {
    const h = this.isin(e); this.rd.domElement.style.cursor = h ? 'pointer' : 'grab';
    this.hover(h?.slot ? h.i : -1);
    if (!h) { this.ipucu.classList.remove('on'); return; }
    const r = this.kok.getBoundingClientRect();
    this.ipucu.innerHTML = h.pilot ? `<b>${this.o.ilce[h.pilot].name}</b><span>Pilot stant · QR'ı okutabilirsiniz</span>` : (() => { const y = this.o.slotYeg(h.slot.id); return `<b>${y ? y.ad : 'Boş stant'}</b><span>${h.slot.id} · ${h.slot.bolge}${y?.il ? ' · ' + y.il : ''}</span>`; })();
    this.ipucu.style.left = (e.clientX - r.left) + 'px'; this.ipucu.style.top = (e.clientY - r.top) + 'px'; this.ipucu.classList.add('on');
  }
  tikla(e) {
    const h = this.isin(e); if (!h) return;
    if (h.pilot) { this.odakPilot(h.pilot); this.o.onPilot?.(h.pilot, e); }
    else { this.odakSlot(h.slot.id); this.o.onSlot?.(h.slot, e); }
  }
  odakSlot(id, uzak = 9) {
    const s = this.o.plan.slotlar.find(x => x.id === id); if (!s) return; this.turDur(); this.seciliSlot = id; this.renkle();
    this.kamHedef = { poz: new THREE.Vector3(s.x + 2, uzak * .7, s.z + s.yon * uzak), bak: new THREE.Vector3(s.x, 1, s.z), hiz: 2.2 };
  }
  odakPilot(k, yakin = false) {
    const p = this.pilot.find(x => x.k === k); if (!p) return; this.turDur(); this.seciliSlot = null; this.renkle();
    this.kamHedef = yakin ? { poz: new THREE.Vector3(p.x + .8, 2.6, p.z + 5.2), bak: new THREE.Vector3(p.x + .6, 1.8, p.z), hiz: 2.4 } : { poz: new THREE.Vector3(p.x + 1.5, 6.5, p.z + 11), bak: new THREE.Vector3(p.x, 1.6, p.z), hiz: 2.2 };
  }
  odakBolge(b) {
    const a = this.o.plan.alanlar.find(x => x.bolge === b); if (!a) return; this.turDur();
    const cx = a.x + a.w / 2, cz = a.z + a.d / 2; this.kamHedef = { poz: new THREE.Vector3(cx, 20, cz + 22), bak: new THREE.Vector3(cx, 0, cz), hiz: 2 };
  }
  odakNokta(x, z) { this.turDur(); this.kamHedef = { poz: new THREE.Vector3(x, 22, z + 24), bak: new THREE.Vector3(x, 0, z), hiz: 2 }; }
  genel() { this.turDur(); this.seciliSlot = null; this.renkle(); this.kamHedef = { poz: new THREE.Vector3(-8, 62, 64), bak: new THREE.Vector3(-3, 0, -2), hiz: 1.8 }; }
  tur() {
    const P = this.pilot.map(p => [new THREE.Vector3(p.x + 2, 5, p.z + 10), new THREE.Vector3(p.x, 1.5, p.z)]);
    const A = this.o.plan.alanlar.map(a => [new THREE.Vector3(a.x + a.w / 2 - 6, 11, a.z + a.d + 12), new THREE.Vector3(a.x + a.w / 2, 0, a.z + a.d / 2)]);
    this.turL = [[new THREE.Vector3(-8, 62, 64), new THREE.Vector3(-3, 0, -2)], ...P, A[0], A[1], A[2], A[3], [new THREE.Vector3(9, 6, 12), new THREE.Vector3(9, 3, 24)], A[4], A[5], A[6]];
    this.turAcik = true; this.turI = 0; this.turT = this.zaman - 10;
  }
  turDur() { this.turAcik = false; }
  yerlesimGuncelle() { this.renkle(); }
  stantVurgula(id) {
    const s = this.o.plan.slotlar.find(x => x.id === id); if (!s) return;
    const h = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 10, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFD45E, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    h.position.set(s.x, 5, s.z); this.sahne.add(h);
    this.anim.push({ t0: this.zaman, sure: 2.4, f: p => { h.material.opacity = Math.sin(p * Math.PI) * .4; if (p >= 1) { this.sahne.remove(h); h.geometry.dispose(); } } });
  }

  /* ---------- Döngü ---------- */
  boyut() { const w = this.kok.clientWidth || 1, h = this.kok.clientHeight || 1; this.rd.setSize(w, h, false); this.kam.aspect = w / h; this.kam.updateProjectionMatrix(); }
  baslat() { if (this.raf || this.yok) return; this.saat.getDelta(); const d = () => { this.raf = requestAnimationFrame(d); this.kare(); }; this.raf = requestAnimationFrame(d); }
  durdur() { cancelAnimationFrame(this.raf); this.raf = null; }
  tasi(kap) { if (this.kok.parentNode !== kap) kap.appendChild(this.kok); this.boyut(); this.io.unobserve(this.kok); this.io.observe(this.kok); this.baslat(); }
  kare() {
    if (!this.kok.isConnected) { this.durdur(); return; }
    if (this.gorunur === false || document.hidden) return;
    const dt = Math.min(this.saat.getDelta(), .05); this.zaman += dt; const z = this.zaman;
    if (this.turAcik && z - this.turT > 5) { this.turT = z; const [p, b] = this.turL[this.turI++ % this.turL.length]; this.kamHedef = { poz: p.clone(), bak: b.clone(), hiz: .8, tur: true }; }
    if (this.kamHedef) {
      const k = 1 - Math.exp(-dt * this.kamHedef.hiz); this.kam.position.lerp(this.kamHedef.poz, k); this.kontrol.target.lerp(this.kamHedef.bak, k);
      if (!this.kamHedef.tur && this.kam.position.distanceTo(this.kamHedef.poz) < .04) this.kamHedef = null;
    }
    this.kontrol.update();
    // ziyaretçiler
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pz = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    this.kisi.forEach((k, i) => {
      if (k.bekle > 0) k.bekle -= dt;
      else {
        if (!k.yol.length) this.yolBul(k);
        const h = k.yol[0], d = h.clone().sub(k.p), L = d.length();
        if (L < .05) { k.yol.shift(); if (!k.yol.length) k.bekle = 1 + Math.random() * 4; }
        else { d.normalize(); k.p.addScaledVector(d, Math.min(L, k.hiz * dt)); k.yon = Math.atan2(d.x, d.z); }
      }
      const zip = k.bekle > 0 ? 0 : Math.abs(Math.sin(z * 9 + k.faz)) * .06;
      q.setFromAxisAngle(up, k.yon); s.setScalar(k.b);
      pz.set(k.p.x, (.48 + zip) * k.b, k.p.z); m.compose(pz, q, s); this.gov.setMatrixAt(i, m);
      pz.set(k.p.x, (1.08 + zip) * k.b, k.p.z); m.compose(pz, q, s); this.basM.setMatrixAt(i, m);
    });
    this.gov.instanceMatrix.needsUpdate = true; this.basM.instanceMatrix.needsUpdate = true;
    this.pilot?.forEach((p, i) => { const f = (z * .8 + i * .3) % 1; p.qrHalka.scale.setScalar(1 + f * .5); p.qrHalka.material.opacity = (1 - f) * .9; p.isik.material.opacity = .05 + .03 * Math.sin(z * 2 + i); });
    this.spot.forEach((sp, i) => { sp.rotation.z = Math.sin(z * .8 + i * 2) * .35; });
    if (Math.floor(z * 20) !== this._l) { this._l = Math.floor(z * 20); this.ledCiz(z); }
    this.anim = this.anim.filter(a => { const p = Math.min(1, (z - a.t0) / a.sure); a.f(p, dt); return p < 1; });
    this.rd.render(this.sahne, this.kam);
    if (this.o.onKamera && Math.floor(z * 8) !== this._k) { this._k = Math.floor(z * 8); this.o.onKamera(this.kam.position, this.kontrol.target); }
  }
  yokEt() { this.yok = true; this.durdur(); this.ro.disconnect(); this.io.disconnect(); this.kontrol.dispose(); this.rd.dispose(); this.kok.remove(); }
}
