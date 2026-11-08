/* 3D modüllerini klasik betiklere açar: window.YF3D */
import { Turkiye } from './turkiye.js';
import { Fuar } from './fuar.js';
const destek = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
window.YF3D = { Turkiye, Fuar, destek };
window.dispatchEvent(new Event('yf3d'));
