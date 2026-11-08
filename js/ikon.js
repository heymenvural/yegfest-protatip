/* Çizgi ikonlar */
const IK = {
  salon: '<path d="M3 20h18M12 4l8 16M12 4 4 20M9 20l3-6 3 6"/><path d="M12 4V2l3 1-3 1"/>',
  harita: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  yonetim: '<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6M4 21h16"/>',
  panel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  icerik: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
  yeg: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  stant: '<path d="M3 9h18l-2-5H5z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
  takvim: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  ara: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  ok: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arti: '<path d="M12 5v14M5 12h14"/>',
  indir: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  yukle: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  parilti: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  hedef: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/>',
  katman: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  dunya: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  yazdir: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
  tik: '<path d="m5 12 4.5 4.5L19 7"/>',
  bina: '<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/>',
  goz: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ik = (n, s = 18) => `<svg class="i" viewBox="0 0 24 24" style="width:${s}px;height:${s}px">${IK[n] || ''}</svg>`;
