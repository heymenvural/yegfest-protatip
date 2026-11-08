/* =====================================================================
   HERO 3D SAHNE — dalgalanan tarla sıraları, sensörler, veri akışı, dron
===================================================================== */
import * as THREE from 'three';

let R = null; // aktif sahne

function kur(canvas) {
  durdur();
  if (!canvas || !document.body.contains(canvas)) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.classList.add('yok'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f1e33, 0.034);
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  const kok = new THREE.Group(); scene.add(kok);

  /* tarla sıraları */
  const SIRA = 46, NOK = 150, GEN = 64, DER = 52;
  const yuk = (x, z, t) => Math.sin(x * 0.16 + t * 0.6) * 0.55 + Math.cos(z * 0.21 - t * 0.4) * 0.65 + Math.sin((x + z) * 0.07) * 1.1;
  const altin = new THREE.Color(0xE3B341), mavi = new THREE.Color(0x8EC3F0), lacivert = new THREE.Color(0x2E78C7);
  const siralar = [];
  for (let r = 0; r < SIRA; r++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NOK * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NOK * 3), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
    l.userData.z = -DER / 2 + (r / (SIRA - 1)) * DER; kok.add(l); siralar.push(l);
  }

  /* sensörler */
  const sensorler = [];
  const ringGeo = new THREE.RingGeometry(0.15, 0.22, 40);
  for (let i = 0; i < 16; i++) {
    const x = (Math.random() - 0.5) * 40, z = (Math.random() - 0.5) * 34;
    const grp = new THREE.Group();
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: 0xE3B341 }));
    top.position.y = 1.1;
    const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), new THREE.MeshBasicMaterial({ color: 0xE3B341, transparent: true, opacity: 0.55 }));
    cubuk.position.y = 0.55;
    const halka = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xE3B341, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    halka.rotation.x = -Math.PI / 2; halka.position.y = 0.05;
    grp.add(top, cubuk, halka); grp.userData = { x, z, faz: Math.random() * 3, halka, top };
    kok.add(grp); sensorler.push(grp);
  }

  /* merkez istasyon + veri paketleri */
  const merkez = new THREE.Vector3(4, 7.5, -8);
  const istasyon = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
  istasyon.position.copy(merkez); kok.add(istasyon);
  const ic = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: 0xE3B341 }));
  ic.position.copy(merkez); kok.add(ic);
  const yaylar = [], paketler = [];
  const paketGeo = new THREE.SphereGeometry(0.07, 8, 8), paketMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  sensorler.forEach((s, i) => {
    const bas = new THREE.Vector3(s.userData.x, 0, s.userData.z);
    const egri = new THREE.QuadraticBezierCurve3(bas, new THREE.Vector3((bas.x + merkez.x) / 2, merkez.y + 2.5, (bas.z + merkez.z) / 2), merkez);
    const g = new THREE.BufferGeometry().setFromPoints(egri.getPoints(40));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x8EC3F0, transparent: true, opacity: 0.18 }));
    kok.add(l); yaylar.push({ egri, s });
    const p = new THREE.Mesh(paketGeo, paketMat); p.userData = { egri, t: Math.random(), hiz: 0.12 + Math.random() * 0.12 }; kok.add(p); paketler.push(p);
  });

  /* dron + tarama konisi */
  const dron = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.7), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dron.add(govde);
  const pervaneler = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
    const kol = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: 0xcfd8e3 }));
    kol.position.set(a * 0.3, 0, b * 0.3); kol.rotation.y = Math.atan2(a, b); dron.add(kol);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.015, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
    p.position.set(a * 0.5, 0.08, b * 0.5); dron.add(p); pervaneler.push(p);
  });
  const koni = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xE3B341, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false }));
  koni.position.y = -2.5; dron.add(koni);
  kok.add(dron);

  /* boyut ve fare */
  const fare = { x: 0, y: 0, hx: 0, hy: 0 };
  const onMove = e => { fare.hx = (e.clientX / innerWidth - 0.5); fare.hy = (e.clientY / innerHeight - 0.5); };
  addEventListener('pointermove', onMove, { passive: true });
  const boyut = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    kok.position.x = w > 900 ? 7 : 0;
  };
  const ro = new ResizeObserver(boyut); ro.observe(canvas); boyut();

  const tmp = new THREE.Color();
  const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = performance.now(), gorunur = true;
  const io = new IntersectionObserver(([e]) => gorunur = e.isIntersecting); io.observe(canvas);

  function kare(now) {
    R.raf = requestAnimationFrame(kare);
    if (!gorunur || document.hidden) return;
    const t = azalt ? 0 : (now - t0) / 1000;
    // dron rotası (sekiz)
    const dx = Math.sin(t * 0.25) * 14, dz = Math.sin(t * 0.5) * 9 - 2;
    dron.position.set(dx, 5.2 + Math.sin(t * 1.4) * 0.25, dz);
    dron.rotation.z = Math.cos(t * 0.25) * 0.18; dron.rotation.x = Math.cos(t * 0.5) * 0.12;
    pervaneler.forEach((p, i) => p.rotation.y = t * 40 + i);
    // sıralar
    for (const l of siralar) {
      const z = l.userData.z, pos = l.geometry.attributes.position.array, col = l.geometry.attributes.color.array;
      const yak = (z + DER / 2) / DER; // 0 uzak, 1 yakın
      for (let i = 0; i < NOK; i++) {
        const x = -GEN / 2 + (i / (NOK - 1)) * GEN, y = yuk(x, z, t);
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        const dd = Math.hypot(x - dx, z - dz), tara = Math.max(0, 1 - dd / 3.2);
        tmp.copy(lacivert).lerp(mavi, yak * 0.8).lerp(altin, Math.max(tara, yak > 0.85 ? (yak - 0.85) * 3 : 0));
        const parlak = 0.35 + yak * 0.5 + tara * 0.9;
        col[i * 3] = tmp.r * parlak; col[i * 3 + 1] = tmp.g * parlak; col[i * 3 + 2] = tmp.b * parlak;
      }
      l.geometry.attributes.position.needsUpdate = true; l.geometry.attributes.color.needsUpdate = true;
    }
    // sensörler
    for (const s of sensorler) {
      const { x, z, faz, halka, top } = s.userData, y = yuk(x, z, t);
      s.position.set(x, y, z);
      const k = ((t * 0.6 + faz) % 1.6) / 1.6;
      halka.scale.setScalar(1 + k * 9); halka.material.opacity = (1 - k) * 0.7;
      top.scale.setScalar(1 + Math.sin(t * 3 + faz) * 0.18);
    }
    // paketler
    for (const p of paketler) { p.userData.t = (p.userData.t + p.userData.hiz * 0.016) % 1; p.position.copy(p.userData.egri.getPoint(p.userData.t)); }
    istasyon.rotation.y = t * 0.6; istasyon.rotation.x = t * 0.3; ic.rotation.y = -t;
    // kamera
    fare.x += (fare.hx - fare.x) * 0.04; fare.y += (fare.hy - fare.y) * 0.04;
    cam.position.set(Math.sin(t * 0.05) * 3 + fare.x * 4, 9 - fare.y * 2.5, 24);
    cam.lookAt(kok.position.x * 0.55, 0.5, -5);
    renderer.render(scene, cam);
  }
  R = { renderer, ro, io, onMove, raf: requestAnimationFrame(kare) };
}

function durdur() {
  if (!R) return;
  cancelAnimationFrame(R.raf); R.ro.disconnect(); R.io.disconnect(); removeEventListener('pointermove', R.onMove);
  R.renderer.dispose(); R = null;
}

window.HKSAHNE = { kur, durdur };
if (window.HKSAHNE_BEKLE) { kur(window.HKSAHNE_BEKLE); window.HKSAHNE_BEKLE = null; }
