/* =====================================================================
   YEGFEST · 3D Türkiye haritası (Three.js)
   - Kabartma Türkiye, bölgelere göre renkli nokta dokusu
   - Her YEG bir ışık sütunu (renk: bölge / içerik aşaması)
   - Ankara'daki festivale akan yaylar, seçim, filtre, odaklanma
===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from '../../vendor/addons/OrbitControls.js';

const K = Math.cos(39 * Math.PI / 180), S = 1.0, X0 = 35.3, Z0 = 38.9, KAL = 0.42;
export const izd = (lon, lat) => new THREE.Vector3((lon - X0) * K * S, 0, -(lat - Z0) * S);

function isik() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const YAY = {
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 uRenk; uniform float uZaman; uniform float uOfs; uniform float uIlerleme; uniform float uSeffaf; varying vec2 vUv;
    void main(){ if(vUv.x > uIlerleme) discard; float d = fract(vUv.x - uZaman*.45 - uOfs); float p = smoothstep(.8, 1., d);
      gl_FragColor = vec4(uRenk*(.6 + p*1.6), (.25 + p*.75) * uSeffaf); }`
};

export class Turkiye {
  constructor(kap, o = {}) {
    this.o = Object.assign({ veri: null, yegler: [], renkMod: 'bolge', bolgeRenk: {}, asamaRenk: [], onSec: null, onHover: null, akis: false, etiket: true }, o);
    this.kok = document.createElement('div'); this.kok.className = 'tr3-kok'; this.kok.style.cssText = 'position:absolute;inset:0';
    kap.appendChild(this.kok);
    this.saat = new THREE.Clock(); this.zaman = 0; this.efekt = []; this.filtreF = null; this.secili = null;
    this.kur();
  }
  kur() {
    const rd = this.rd = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rd.setPixelRatio(Math.min(devicePixelRatio, 2)); rd.outputColorSpace = THREE.SRGBColorSpace;
    rd.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:pan-y';
    this.kok.appendChild(rd.domElement);
    const sc = this.sahne = new THREE.Scene();
    this.kam = new THREE.PerspectiveCamera(36, 1, 0.1, 200); this.kam.position.set(0, 26, 2);
    const k = this.kontrol = new OrbitControls(this.kam, rd.domElement);
    k.enableDamping = true; k.dampingFactor = 0.08; k.minDistance = 4; k.maxDistance = 30; k.maxPolarAngle = 1.2; k.minPolarAngle = 0.15;
    k.target.set(0, 0, 0.6); k.enablePan = true; k.screenSpacePanning = false; k.minAzimuthAngle = -0.9; k.maxAzimuthAngle = 0.9;
    k.addEventListener('start', () => { this.kamHedef = null; });
    this.dokuIsik = isik();

    sc.add(new THREE.HemisphereLight(0xffffff, 0x3b4c66, 1.1));
    const g = new THREE.DirectionalLight(0xfff3dc, 1.4); g.position.set(-6, 14, 8); sc.add(g);

    // deniz/zemin
    const zemin = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec2 vP; void main(){ float r = length(vP)/26.; vec2 g = abs(fract(vP*.5)-.5); float c = 1.-smoothstep(0.,.03,min(g.x,g.y));
        vec3 col = mix(vec3(.11,.22,.38), vec3(.06,.12,.22), r) + c*.035; gl_FragColor = vec4(col, 1.-smoothstep(.75,1.,r)); }`
    }));
    zemin.rotation.x = -Math.PI / 2; zemin.position.y = -0.02; sc.add(zemin);

    this.grup = new THREE.Group(); sc.add(this.grup);
    this.harita(); this.noktalar(); this.pinler(); this.ankaraKur(); this.yaylar();

    this.etiketKat = document.createElement('div'); this.etiketKat.className = 'tr3-etiketler'; this.kok.appendChild(this.etiketKat);
    this.ipucu = document.createElement('div'); this.ipucu.className = 'tr3-ipucu'; this.kok.appendChild(this.ipucu);

    this.ray = new THREE.Raycaster(); this.fare = new THREE.Vector2();
    const el = rd.domElement; let bas = null;
    el.addEventListener('pointerdown', e => bas = [e.clientX, e.clientY]);
    el.addEventListener('pointerup', e => { if (bas && Math.hypot(e.clientX - bas[0], e.clientY - bas[1]) < 6) { const id = this.bul(e); if (id) this.o.onSec?.(id); } bas = null; });
    el.addEventListener('pointermove', e => { if (bas && e.buttons) { this.ipucu.classList.remove('on'); return; } this.uzerinde(e); });
    el.addEventListener('pointerleave', () => { this.ipucu.classList.remove('on'); this.uzerindeId = null; });

    this.ro = new ResizeObserver(() => this.boyut()); this.ro.observe(this.kok);
    this.io = new IntersectionObserver(e => { this.gorunur = e[0].isIntersecting; if (this.gorunur) this.baslat(); }); this.io.observe(this.kok);
    this.boyut(); this.baslat();
    // açılış uçuşu
    this.kamHedef = { poz: new THREE.Vector3(0, 11.5, 12.5), bak: new THREE.Vector3(0, 0, 0.4), hiz: 1.2 };
  }

  harita() {
    const v = this.o.veri, sekiller = v.sinir.map(p => { const s = new THREE.Shape(); p.forEach(([lon, lat], i) => { const q = izd(lon, lat); i ? s.lineTo(q.x, -q.z) : s.moveTo(q.x, -q.z); }); return s; });
    const geo = new THREE.ExtrudeGeometry(sekiller, { depth: KAL, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    const ust = new THREE.MeshStandardMaterial({ color: 0xF1EBDB, roughness: .85 }), yan = new THREE.MeshStandardMaterial({ color: 0x1F3A5F, roughness: .6, metalness: .1 });
    const m = new THREE.Mesh(geo, [ust, yan]); this.grup.add(m);
    // kıyı çizgisi parıltısı
    v.sinir.forEach(p => {
      const pts = p.map(([lon, lat]) => izd(lon, lat).setY(0.01));
      const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7FB0E6, transparent: true, opacity: .55 }));
      this.grup.add(l);
    });
    // gölge
    const gol = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), new THREE.MeshBasicMaterial({ map: this.dokuIsik, color: 0x000000, transparent: true, opacity: .35, depthWrite: false }));
    gol.rotation.x = -Math.PI / 2; gol.position.set(0.4, -0.01, 0.9); this.grup.add(gol);
  }
  noktalar() {
    const v = this.o.veri, n = v.nokta.length / 3, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const q = izd(v.nokta[i * 3], v.nokta[i * 3 + 1]); pos.set([q.x, KAL + 0.045, q.z], i * 3);
      const c = new THREE.Color(this.o.bolgeRenk[v.bolgeler[v.nokta[i * 3 + 2]]] || '#888').lerp(new THREE.Color('#F1EBDB'), 0.35);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.noktaMat = new THREE.PointsMaterial({ size: 0.085, vertexColors: true, transparent: true, opacity: .95, sizeAttenuation: true });
    this.grup.add(new THREE.Points(g, this.noktaMat));
  }
  pinler() {
    const l = this.o.yegler, n = l.length;
    const silGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 8); silGeo.translate(0, 0.5, 0);
    const basGeo = new THREE.SphereGeometry(0.07, 12, 10);
    this.sutun = new THREE.InstancedMesh(silGeo, new THREE.MeshStandardMaterial({ roughness: .4, emissive: 0x111111 }), n);
    this.bas = new THREE.InstancedMesh(basGeo, new THREE.MeshStandardMaterial({ roughness: .3, emissiveIntensity: .6 }), n);
    this.sutun.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.bas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.grup.add(this.sutun, this.bas);
    this.pin = l.map((y, i) => ({ y, i, p: izd(y.lon, y.lat).setY(KAL + 0.02), yuk: y.pilot ? 1.3 : 0.28 + (y.asama / 6) * 0.45, simdi: 0, gecikme: 0.4 + i * 0.006, olcek: 1, gorunur: true }));
    this.renkle();
    // pilot halo ve halka
    this.halkalar = this.pin.filter(p => p.y.pilot).map(p => {
      const h = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.17, 40), new THREE.MeshBasicMaterial({ color: 0xE3B341, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      h.rotation.x = -Math.PI / 2; h.position.copy(p.p).setY(KAL + 0.06); this.grup.add(h);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dokuIsik, color: 0xFFD45E, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(.6); this.grup.add(s);
      return { p, h, s };
    });
  }
  renkle() {
    const c = new THREE.Color();
    this.pin.forEach(p => {
      const y = p.y;
      if (y.pilot) c.set('#E3B341');
      else if (this.o.renkMod === 'asama') c.set(this.o.asamaRenk[y.asama] || '#999');
      else c.set(this.o.bolgeRenk[y.bolge] || '#999');
      if (!p.gorunur) c.lerp(new THREE.Color('#2a3a52'), 0.75);
      this.sutun.setColorAt(p.i, c); this.bas.setColorAt(p.i, c);
    });
    this.sutun.instanceColor.needsUpdate = true; this.bas.instanceColor.needsUpdate = true;
  }
  ankaraKur() {
    const p = izd(...(this.o.ankara || [32.85, 39.93])).setY(KAL + 0.02), g = new THREE.Group(); g.position.copy(p);
    const k = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshStandardMaterial({ color: 0xFFE08A, emissive: 0xC9A227, emissiveIntensity: .7 })); k.position.y = 1.7;
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), new THREE.MeshBasicMaterial({ color: 0xFFE08A })); d.position.y = .8;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dokuIsik, color: 0xFFD45E, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(1.6); s.position.y = 1.7;
    const h = new THREE.Mesh(new THREE.RingGeometry(.3, .38, 48), new THREE.MeshBasicMaterial({ color: 0xFFE08A, transparent: true, side: THREE.DoubleSide, depthWrite: false })); h.rotation.x = -Math.PI / 2; h.position.y = .05;
    g.add(k, d, s, h); this.grup.add(g); this.ankara = { g, k, s, h, p };
  }
  yaylar() {
    this.yayGrup = new THREE.Group(); this.grup.add(this.yayGrup); this.yayL = [];
    const hedef = this.ankara.p.clone().setY(KAL + 1.7);
    this.pin.forEach((p, i) => {
      const a = p.p.clone().setY(KAL + p.yuk), m = a.clone().lerp(hedef, .5); m.y += 0.6 + a.distanceTo(hedef) * 0.18;
      const egri = new THREE.QuadraticBezierCurve3(a, m, hedef);
      const mat = new THREE.ShaderMaterial({ ...YAY, uniforms: { uRenk: { value: new THREE.Color(p.y.pilot ? '#FFE08A' : this.o.bolgeRenk[p.y.bolge]) }, uZaman: { value: 0 }, uOfs: { value: Math.random() }, uIlerleme: { value: 0 }, uSeffaf: { value: p.y.pilot ? 1 : .7 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const t = new THREE.Mesh(new THREE.TubeGeometry(egri, 32, p.y.pilot ? 0.022 : 0.012, 4), mat);
      this.yayGrup.add(t); this.yayL.push({ t, mat, p, gecikme: i * 0.008 });
    });
    this.yayGrup.visible = this.o.akis;
  }

  /* ---------- API ---------- */
  akis(acik) { this.o.akis = acik; this.yayGrup.visible = acik; if (acik) { this.akisT0 = this.zaman; this.yayL.forEach(y => y.mat.uniforms.uIlerleme.value = 0); } }
  renkModu(m) { this.o.renkMod = m; this.renkle(); }
  filtre(f) { this.filtreF = f; this.pin.forEach(p => p.gorunur = !f || f(p.y)); this.renkle(); this.yayL.forEach(y => y.t.visible = y.p.gorunur); }
  sec(id) { this.secili = id; const p = this.pin.find(x => x.y.id === id); if (p) { p.olcek = 2.2; this.ping(id); } }
  odak(id, uzak = 5.5) {
    const p = this.pin.find(x => x.y.id === id); if (!p) return;
    this.kamHedef = { poz: new THREE.Vector3(p.p.x + uzak * 0.15, uzak * 0.8, p.p.z + uzak * 0.85), bak: p.p.clone(), hiz: 2 };
  }
  bakis(px, py, pz, bx, by, bz, hiz = 1.4) { this.kamHedef = { poz: new THREE.Vector3(px, py, pz), bak: new THREE.Vector3(bx, by, bz), hiz }; }
  genel() { this.kamHedef = { poz: new THREE.Vector3(0, 11.5, 12.5), bak: new THREE.Vector3(0, 0, 0.4), hiz: 2 }; }
  ankaraOdak() { const a = this.ankara.p; this.kamHedef = { poz: new THREE.Vector3(a.x - 2, 9, a.z + 10), bak: a.clone(), hiz: 1.6 }; }
  ping(id) {
    const p = this.pin.find(x => x.y.id === id); if (!p) return;
    const h = new THREE.Mesh(new THREE.RingGeometry(.1, .14, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    h.rotation.x = -Math.PI / 2; h.position.copy(p.p).setY(KAL + .07); this.grup.add(h); this.efekt.push({ m: h, t0: this.zaman });
  }
  yegleriGuncelle(l) {
    this.grup.remove(this.sutun, this.bas, this.yayGrup); this.halkalar.forEach(h => this.grup.remove(h.h, h.s));
    this.o.yegler = l; this.pinler(); this.yaylar(); if (this.filtreF) this.filtre(this.filtreF);
  }

  bul(e) {
    const r = this.rd.domElement.getBoundingClientRect();
    this.fare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.fare, this.kam);
    const h = this.ray.intersectObjects([this.bas, this.sutun], false)[0];
    if (h && h.instanceId != null) { const p = this.pin[h.instanceId]; return p.gorunur ? p.y.id : null; }
    // yakın pin (dokunmatik için tolerans)
    let en = null, ed = 22; const v = new THREE.Vector3();
    this.pin.forEach(p => { if (!p.gorunur) return; v.copy(p.p).setY(KAL + p.yuk).project(this.kam); const x = (v.x * .5 + .5) * r.width, y = (-v.y * .5 + .5) * r.height; const d = Math.hypot(x - (e.clientX - r.left), y - (e.clientY - r.top)); if (d < ed) { ed = d; en = p; } });
    return en?.y.id;
  }
  uzerinde(e) {
    const id = this.bul(e); this.uzerindeId = id; this.rd.domElement.style.cursor = id ? 'pointer' : 'grab';
    if (!id) { this.ipucu.classList.remove('on'); return; }
    const y = this.pin.find(p => p.y.id === id).y, r = this.kok.getBoundingClientRect();
    this.ipucu.innerHTML = this.o.ipucuHTML ? this.o.ipucuHTML(y) : esc(y.ad);
    this.ipucu.style.left = (e.clientX - r.left) + 'px'; this.ipucu.style.top = (e.clientY - r.top) + 'px'; this.ipucu.classList.add('on');
  }

  boyut() { const w = this.kok.clientWidth || 1, h = this.kok.clientHeight || 1; this.rd.setSize(w, h, false); this.kam.aspect = w / h; this.kam.fov = w / h < 1 ? 52 : 36; this.kam.updateProjectionMatrix(); }
  baslat() { if (this.raf || this.yok) return; this.saat.getDelta(); const d = () => { this.raf = requestAnimationFrame(d); this.kare(); }; this.raf = requestAnimationFrame(d); }
  durdur() { cancelAnimationFrame(this.raf); this.raf = null; }
  tasi(kap) { if (this.kok.parentNode !== kap) kap.appendChild(this.kok); this.boyut(); this.io.unobserve(this.kok); this.io.observe(this.kok); this.baslat(); }
  kare() {
    if (!this.kok.isConnected) { this.durdur(); return; }
    if (this.gorunur === false || document.hidden) return;
    const dt = Math.min(this.saat.getDelta(), .05); this.zaman += dt; const z = this.zaman;
    if (this.kamHedef) {
      const k = 1 - Math.exp(-dt * this.kamHedef.hiz);
      this.kam.position.lerp(this.kamHedef.poz, k); this.kontrol.target.lerp(this.kamHedef.bak, k);
      if (this.kam.position.distanceTo(this.kamHedef.poz) < .02) this.kamHedef = null;
    }
    this.kontrol.update();
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pz = new THREE.Vector3();
    this.pin.forEach(p => {
      const hedef = z > p.gecikme ? p.yuk * (p.gorunur ? 1 : .35) * (p.y.id === this.uzerindeId ? 1.25 : 1) : 0.001;
      p.simdi += (hedef - p.simdi) * (1 - Math.exp(-dt * 6)); p.olcek += (1 - p.olcek) * (1 - Math.exp(-dt * 3));
      const sec = p.y.id === this.secili ? 1.6 : 1;
      s.set(sec * (p.y.pilot ? 1.6 : 1), Math.max(p.simdi, .001), sec * (p.y.pilot ? 1.6 : 1)); pz.copy(p.p); m.compose(pz, q, s); this.sutun.setMatrixAt(p.i, m);
      const bo = (p.y.pilot ? 1.7 : 1) * p.olcek * sec * (p.gorunur ? 1 : .6) * (p.y.id === this.uzerindeId ? 1.4 : 1);
      s.setScalar(bo); pz.copy(p.p); pz.y += p.simdi; m.compose(pz, q, s); this.bas.setMatrixAt(p.i, m);
    });
    this.sutun.instanceMatrix.needsUpdate = true; this.bas.instanceMatrix.needsUpdate = true;
    this.halkalar.forEach(({ p, h, s: sp }, i) => { const f = (z * .7 + i * .3) % 1; h.scale.setScalar(1 + f * 3); h.material.opacity = 1 - f; sp.position.copy(p.p); sp.position.y += p.simdi + .02; });
    this.ankara.k.rotation.y += dt * 1.2; this.ankara.k.position.y = 1.7 + Math.sin(z * 2) * .06; const f = (z * .5) % 1; this.ankara.h.scale.setScalar(1 + f * 2.5); this.ankara.h.material.opacity = 1 - f;
    if (this.yayGrup.visible) this.yayL.forEach(y => { const t = Math.max(0, Math.min(1, (z - (this.akisT0 || 0) - y.gecikme) / 1.4)); y.mat.uniforms.uIlerleme.value = 1 - Math.pow(1 - t, 3); y.mat.uniforms.uZaman.value = z; });
    this.efekt = this.efekt.filter(e => { const p = (z - e.t0) / 1.2; if (p >= 1) { this.grup.remove(e.m); e.m.geometry.dispose(); return false; } e.m.scale.setScalar(1 + p * 6); e.m.material.opacity = 1 - p; return true; });
    this.rd.render(this.sahne, this.kam);
    this.etiketCiz();
  }
  etiketCiz() {
    if (!this.o.etiket) { if (this.etiketEl?.size) { this.etiketKat.innerHTML = ''; this.etiketEl.clear(); } return; }
    this.etiketEl ??= new Map();
    const ids = new Set(this.pin.filter(p => p.y.pilot && p.gorunur).map(p => p.y.id)); if (this.secili) ids.add(this.secili); ids.add('__ankara');
    const r = this.kok.getBoundingClientRect(), v = new THREE.Vector3();
    this.etiketEl.forEach((el, id) => { if (!ids.has(id)) { el.remove(); this.etiketEl.delete(id); } });
    ids.forEach(id => {
      let el = this.etiketEl.get(id), konum;
      if (id === '__ankara') { konum = this.ankara.p.clone(); konum.y += 2.6; konum.x += .9; }
      else { const p = this.pin.find(x => x.y.id === id); if (!p) return; konum = p.p.clone(); konum.y += p.simdi + .15; }
      if (!el) { el = document.createElement('div'); el.className = 'tr3-etiket' + (id === '__ankara' ? ' ankara' : ''); el.textContent = id === '__ankara' ? 'YEGFEST · Ankara' : this.pin.find(x => x.y.id === id).y.ad; this.etiketKat.appendChild(el); this.etiketEl.set(id, el); }
      v.copy(konum).project(this.kam);
      el.style.transform = `translate(${(v.x * .5 + .5) * r.width}px,${(-v.y * .5 + .5) * r.height}px) translate(-50%,-120%)`;
      el.style.opacity = v.z < 1 ? 1 : 0;
    });
  }
  yokEt() { this.yok = true; this.durdur(); this.ro.disconnect(); this.io.disconnect(); this.kontrol.dispose(); this.rd.dispose(); this.kok.remove(); }
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
