/* ════════════════════════════════════
   SVG Icon component — Lucide + brand icons
   ════════════════════════════════════ */

import type { CSSProperties, JSX, SVGAttributes } from "react";

interface IconNode {
  type: "path" | "circle" | "rect";
  props: Record<string, string | number | boolean>;
}

interface IconDef {
  children: IconNode[];
  viewBox?: string;
}

const ICONS: Record<string, IconDef> = {
  layers: { children: [
    { type: "path", props: { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" } },
    { type: "path", props: { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" } },
    { type: "path", props: { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" } },
  ] },
  zap: { children: [
    { type: "path", props: { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" } },
  ] },
  monitor: { children: [
    { type: "rect", props: { width: 20, height: 14, x: 2, y: 3, rx: 2 } },
    { type: "path", props: { d: "M8 21h8m-4-4v4" } },
  ] },
  server: { children: [
    { type: "rect", props: { width: 20, height: 8, x: 2, y: 2, rx: 2, ry: 2 } },
    { type: "rect", props: { width: 20, height: 8, x: 2, y: 14, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M6 6h.01M6 18h.01" } },
  ] },
  code: { children: [
    { type: "path", props: { d: "m16 18 6-6-6-6M8 6l-6 6 6 6" } },
  ] },
  palette: { children: [
    { type: "path", props: { d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" } },
    { type: "circle", props: { cx: 13.5, cy: 6.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 17.5, cy: 10.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 6.5, cy: 12.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 8.5, cy: 7.5, r: 0.5, fill: "currentColor" } },
  ] },
  cpu: { children: [
    { type: "path", props: { d: "M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" } },
    { type: "rect", props: { width: 16, height: 16, x: 4, y: 4, rx: 2 } },
    { type: "rect", props: { width: 8, height: 8, x: 8, y: 8, rx: 1 } },
  ] },
  smartphone: { children: [
    { type: "rect", props: { width: 14, height: 20, x: 5, y: 2, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M12 18h.01" } },
  ] },
  tablet: { children: [
    { type: "rect", props: { width: 16, height: 20, x: 4, y: 2, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M12 18h.01" } },
  ] },
  terminal: { children: [
    { type: "path", props: { d: "M12 19h8M4 17l6-6-6-6" } },
  ] },
  "external-link": { children: [
    { type: "path", props: { d: "M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" } },
  ] },
  menu: { children: [
    { type: "path", props: { d: "M4 5h16M4 12h16M4 19h16" } },
  ] },
  "x-circle": { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 10 } },
    { type: "path", props: { d: "m15 9-6 6m0-6 6 6" } },
  ] },
  github: { children: [
    { type: "path", props: { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" } },
    { type: "path", props: { d: "M9 18c-4.51 2-5-2-7-2" } },
  ] },
  book: { children: [
    { type: "path", props: { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" } },
  ] },
  sun: { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 4 } },
    { type: "path", props: { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" } },
  ] },
  moon: { children: [
    { type: "path", props: { d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" } },
  ] },
  "arrow-left": { children: [
    { type: "path", props: { d: "m12 19-7-7 7-7m7 7H5" } },
  ] },
  tag: { children: [
    { type: "path", props: { d: "M12 2H2v10l9.29 9.29a2 2 0 0 0 2.83 0l6.17-6.17a2 2 0 0 0 0-2.83z" } },
    { type: "circle", props: { cx: 7, cy: 7, r: 1, fill: "currentColor" } },
  ] },
  "chevron-right": { children: [
    { type: "path", props: { d: "m9 18 6-6-6-6" } },
  ] },
  "chevron-down": { children: [
    { type: "path", props: { d: "m6 9 6 6 6-6" } },
  ] },
  "chevron-up": { children: [
    { type: "path", props: { d: "m18 15-6-6-6 6" } },
  ] },
  "share-2": { children: [
    { type: "circle", props: { cx: 18, cy: 5, r: 3 } },
    { type: "circle", props: { cx: 6, cy: 12, r: 3 } },
    { type: "circle", props: { cx: 18, cy: 19, r: 3 } },
    { type: "path", props: { d: "m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" } },
  ] },
  dashboard: { children: [
    { type: "rect", props: { width: 7, height: 9, x: 3, y: 3, rx: 1 } },
    { type: "rect", props: { width: 7, height: 5, x: 14, y: 3, rx: 1 } },
    { type: "rect", props: { width: 7, height: 9, x: 14, y: 12, rx: 1 } },
    { type: "rect", props: { width: 7, height: 5, x: 3, y: 16, rx: 1 } },
  ] },
  download: { children: [
    { type: "path", props: { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" } },
    { type: "path", props: { d: "m7 10 5 5 5-5" } },
    { type: "path", props: { d: "M12 15V3" } },
  ] },
  "file-text": { children: [
    { type: "path", props: { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" } },
    { type: "path", props: { d: "M14 2v6h6" } },
    { type: "path", props: { d: "M16 13H8m8 4H8m-2-8h4" } },
  ] },
  eye: { children: [
    { type: "path", props: { d: "M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" } },
    { type: "circle", props: { cx: 12, cy: 12, r: 3 } },
  ] },
  "eye-off": { children: [
    { type: "path", props: { d: "M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" } },
    { type: "path", props: { d: "M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61" } },
    { type: "path", props: { d: "M2 2l20 20" } },
  ] },
  settings: { children: [
    { type: "path", props: { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" } },
    { type: "circle", props: { cx: 12, cy: 12, r: 3 } },
  ] },
  users: { children: [
    { type: "path", props: { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" } },
    { type: "circle", props: { cx: 9, cy: 7, r: 4 } },
    { type: "path", props: { d: "M22 21v-2a4 4 0 0 0-3-3.87" } },
    { type: "path", props: { d: "M16 3.13a4 4 0 0 1 0 7.75" } },
  ] },
  user: { children: [
    { type: "path", props: { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" } },
    { type: "circle", props: { cx: 12, cy: 7, r: 4 } },
  ] },
  "user-plus": { children: [
    { type: "path", props: { d: "M2 21a8 8 0 0 1 13.292-6" } },
    { type: "circle", props: { cx: 10, cy: 8, r: 5 } },
    { type: "path", props: { d: "M19 16v6m3-3h-6" } },
  ] },
  shield: { children: [
    { type: "path", props: { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" } },
  ] },
  key: { children: [
    { type: "path", props: { d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" } },
    { type: "circle", props: { cx: 16.5, cy: 7.5, r: 0.5, fill: "currentColor" } },
  ] },
  "log-out": { children: [
    { type: "path", props: { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" } },
    { type: "path", props: { d: "m16 17 5-5-5-5" } },
    { type: "path", props: { d: "M21 12H9" } },
  ] },
  plus: { children: [
    { type: "path", props: { d: "M5 12h14" } },
    { type: "path", props: { d: "M12 5v14" } },
  ] },
  search: { children: [
    { type: "circle", props: { cx: 11, cy: 11, r: 8 } },
    { type: "path", props: { d: "m21 21-4.3-4.3" } },
  ] },
  activity: { children: [
    { type: "path", props: { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" } },
  ] },
  check: { children: [
    { type: "path", props: { d: "M20 6 9 17l-5-5" } },
  ] },
  package: { children: [
    { type: "path", props: { d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" } },
    { type: "path", props: { d: "M12 22V12" } },
    { type: "path", props: { d: "m3.3 7 8.7 5 8.7-5" } },
    { type: "path", props: { d: "m7.5 4.27 9 5.15" } },
  ] },
  clock: { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 10 } },
    { type: "path", props: { d: "M12 6v6l4 2" } },
  ] },
  "alert-triangle": { children: [
    { type: "path", props: { d: "M12 9v4" } },
    { type: "path", props: { d: "M12 17h.01" } },
    { type: "path", props: { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" } },
  ] },
  radio: { children: [
    { type: "path", props: { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9" } },
    { type: "path", props: { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" } },
    { type: "circle", props: { cx: 12, cy: 12, r: 2 } },
    { type: "path", props: { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" } },
    { type: "path", props: { d: "M19.1 4.9C23 8.8 23 15.2 19.1 19.1" } },
  ] },
  "refresh-cw": { children: [
    { type: "path", props: { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" } },
    { type: "path", props: { d: "M21 3v5h-5" } },
    { type: "path", props: { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" } },
    { type: "path", props: { d: "M3 19v-5h5" } },
  ] },
  globe: { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 10 } },
    { type: "path", props: { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" } },
    { type: "path", props: { d: "M2 12h20" } },
  ] },
  sliders: { children: [
    { type: "path", props: { d: "M21 4h-7" } },
    { type: "path", props: { d: "M10 4H3" } },
    { type: "path", props: { d: "M21 12h-9" } },
    { type: "path", props: { d: "M8 12H3" } },
    { type: "path", props: { d: "M21 20h-5" } },
    { type: "path", props: { d: "M12 20H3" } },
    { type: "path", props: { d: "M14 2v4" } },
    { type: "path", props: { d: "M8 10v4" } },
    { type: "path", props: { d: "M16 18v4" } },
  ] },
  x: { children: [
    { type: "path", props: { d: "M18 6 6 18" } },
    { type: "path", props: { d: "m6 6 12 12" } },
  ] },
  "credit-card": { children: [
    { type: "rect", props: { width: 20, height: 14, x: 2, y: 5, rx: 2 } },
    { type: "path", props: { d: "M2 10h20" } },
  ] },
  flag: { children: [
    { type: "path", props: { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" } },
    { type: "path", props: { d: "M4 22v-7" } },
  ] },
  "trending-up": { children: [
    { type: "path", props: { d: "M22 7l-8.5 8.5-5-5L2 17" } },
    { type: "path", props: { d: "M16 7h6v6" } },
  ] },
  /* ── Brand logos (fill-based) ── */
  "logo-android": { children: [
    { type: "path", props: { fill: "currentColor", d: "M18.44 5.559q-1.015 1.748-2.028 3.498q-.055-.023-.111-.043a12.1 12.1 0 0 0-8.68.033C7.537 8.897 5.868 6.026 5.6 5.56a1 1 0 0 0-.141-.19a1.104 1.104 0 0 0-1.768 1.298c1.947 3.37-.096-.216 1.948 3.36c.017.03-.495.263-1.393 1.017C2.9 12.176.452 14.772 0 18.99h24a11.7 11.7 0 0 0-.746-3.068a12.1 12.1 0 0 0-2.74-4.184a12 12 0 0 0-2.131-1.687c.66-1.122 1.312-2.256 1.965-3.385a1.11 1.11 0 0 0-.008-1.12a1.1 1.1 0 0 0-.852-.532c-.522-.054-.939.313-1.049.545m-.04 8.46c.395.593.324 1.331-.156 1.65c-.48.32-1.188.1-1.582-.493s-.324-1.33.156-1.65c.473-.316 1.182-.11 1.582.494m-11.193-.492c.48.32.55 1.058.156 1.65c-.394.593-1.103.815-1.584.495c-.48-.32-.55-1.058-.156-1.65c.4-.603 1.109-.811 1.584-.495" } },
  ] },
  "logo-apple": { viewBox: "0 0 512 512", children: [
    { type: "path", props: { fill: "currentColor", d: "M349.13 136.86c-40.32 0-57.36 19.24-85.44 19.24c-28.79 0-50.75-19.1-85.69-19.1c-34.2 0-70.67 20.88-93.83 56.45c-32.52 50.16-27 144.63 25.67 225.11c18.84 28.81 44 61.12 77 61.47h.6c28.68 0 37.2-18.78 76.67-19h.6c38.88 0 46.68 18.89 75.24 18.89h.6c33-.35 59.51-36.15 78.35-64.85c13.56-20.64 18.6-31 29-54.35c-76.19-28.92-88.43-136.93-13.08-178.34c-23-28.8-55.32-45.48-85.79-45.48Z" } },
    { type: "path", props: { fill: "currentColor", d: "M340.25 32c-24 1.63-52 16.91-68.4 36.86c-14.88 18.08-27.12 44.9-22.32 70.91h1.92c25.56 0 51.72-15.39 67-35.11c14.72-18.77 25.88-45.37 21.8-72.66" } },
  ] },
  "logo-windows": { children: [
    { type: "path", props: { fill: "currentColor", d: "M3 12V6.75l6-1.32v6.48zm17-9v8.75l-10 .15V5.21zM3 13l6 .09v6.81l-6-1.15zm17 .25V22l-10-1.91V13.1z" } },
  ] },
  "logo-linux": { children: [
    { type: "path", props: { fill: "currentColor", d: "M12.504 0q-.232 0-.48.021c-4.226.333-3.105 4.807-3.17 6.298c-.076 1.092-.3 1.953-1.05 3.02c-.885 1.051-2.127 2.75-2.716 4.521c-.278.832-.41 1.684-.287 2.489a.4.4 0 0 0-.11.135c-.26.268-.45.6-.663.839c-.199.199-.485.267-.797.4c-.313.136-.658.269-.864.68c-.09.189-.136.394-.132.602c0 .199.027.4.055.536c.058.399.116.728.04.97c-.249.68-.28 1.145-.106 1.484c.174.334.535.47.94.601c.81.2 1.91.135 2.774.6c.926.466 1.866.67 2.616.47c.526-.116.97-.464 1.208-.946c.587-.003 1.23-.269 2.26-.334c.699-.058 1.574.267 2.577.2c.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071s1.592-.536 2.257-1.306c.631-.765 1.683-1.084 2.378-1.503c.348-.199.629-.469.649-.853c.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926c-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.36.36 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694c-.533-1.41-1.465-2.638-2.175-3.483c-.796-1.005-1.576-1.957-1.56-3.368c.026-2.152.236-6.133-3.544-6.139" } },
  ] },
};

export type IconName = keyof typeof ICONS;

function renderNode(node: IconNode, key: number): JSX.Element {
  const { type, props } = node;
  const isBrand = props.fill === "currentColor";
  const attrs: SVGAttributes<SVGElement> & Record<string, string | number | boolean> = {
    ...(isBrand
      ? { fill: "currentColor" }
      : {
          fill: "none",
          stroke: "currentColor",
          strokeLinecap: "round" as const,
          strokeLinejoin: "round" as const,
          strokeWidth: 2,
        }),
    ...props,
  };
  if (isBrand) {
    delete attrs.stroke;
    delete attrs.strokeWidth;
    delete attrs.strokeLinecap;
    delete attrs.strokeLinejoin;
  }
  if (type === "circle") return <circle key={key} {...attrs} />;
  if (type === "rect") return <rect key={key} {...attrs} />;
  return <path key={key} {...attrs} />;
}

export default function Icon({
  name,
  size = 24,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const def = ICONS[name];
  if (!def) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={def.viewBox || "0 0 24 24"}
      aria-hidden="true"
      className={className}
      style={style}
    >
      {def.children.map((node, i) => renderNode(node, i))}
    </svg>
  );
}
