#!/usr/bin/env node
/**
 * Maakt public/favicon.svg met de echte omtrek van Zeeland (witte eilanden op
 * een schakel-gradient). Bron: gist met Nederlandse provincie-paths (/tmp/gist.json).
 * Draaien: node scripts/gen-favicon.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const gist = JSON.parse(fs.readFileSync('/tmp/gist.json', 'utf8'));
const svg = gist.files['dutch-provinces.svg'].content;

// alle paths verzamelen die bij Zeeland horen
const els = svg.match(/<path\b[^>]*>/g) || [];
const ds = [];
for (const el of els) {
  const cls = (el.match(/class="([^"]*)"/) || [])[1] || '';
  if (!/\bZeeland\b/.test(cls)) continue;
  if (/\bunknown\b/.test(cls)) continue; // water/onbekende vlakken overslaan
  const dd = (el.match(/\bd="([^"]+)"/) || [])[1];
  if (dd) ds.push(dd);
}
if (!ds.length) {
  console.error('Geen Zeeland-paths gevonden');
  process.exit(1);
}
const d = ds.join(' ');

const cmds = [...new Set((d.match(/[A-Za-z]/g) || []))].join('');
const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
const xs = [];
const ys = [];
for (let i = 0; i < nums.length; i++) (i % 2 === 0 ? xs : ys).push(nums[i]);
const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);
const bw = maxX - minX;
const bh = maxY - minY;
const scale = 78 / Math.max(bw, bh);
const tx = (100 - bw * scale) / 2 - minX * scale;
const ty = (100 - bh * scale) / 2 - minY * scale;

console.log('paths:', ds.length, '| cmds:', cmds);
console.log('bbox:', { minX: +minX.toFixed(1), minY: +minY.toFixed(1), bw: +bw.toFixed(1), bh: +bh.toFixed(1), scale: +scale.toFixed(4) });

const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="zsf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1668a6"/>
      <stop offset="1" stop-color="#16b6ac"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#zsf)"/>
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path d="${d}" fill="#ffffff" fill-rule="evenodd"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(ROOT, 'public', 'favicon.svg'), fav);
console.log('favicon.svg geschreven (' + fav.length + ' bytes)');
